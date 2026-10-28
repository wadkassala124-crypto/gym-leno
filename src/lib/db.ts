import fs from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import {
  initialSiteContent,
  initialVideoBackground,
  initialPlans,
  initialPaymentMethods,
  initialTrainers,
  initialPrograms,
  initialMembers,
  initialBookings,
  initialMedia,
  initialSiteSettings,
  initialGenderSchedules,
  initialTestimonials,
  initialFAQs,
} from './initial-data';
import {
  SiteContent,
  VideoBackgroundConfig,
  MembershipPlan,
  PaymentMethod,
  Trainer,
  Program,
  Member,
  BookingOrder,
  MediaItem,
  SiteSettings,
  Testimonial,
  FAQItem,
} from './types';

export interface DatabaseSchema {
  content: SiteContent;
  video: VideoBackgroundConfig;
  plans: MembershipPlan[];
  paymentMethods: PaymentMethod[];
  trainers: Trainer[];
  programs: Program[];
  members: Member[];
  bookings: BookingOrder[];
  media: MediaItem[];
  settings: SiteSettings;
  testimonials: Testimonial[];
  faqs: FAQItem[];
  adminCredentials: {
    username: string;
    passwordHash: string;
    email: string;
  };
}

const BLOB_PREFIX = 'gym-db-';
const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', 'gym-db.json');
const TMP_DATA_PATH = path.join('/tmp', 'gym-db.json');

// Memory store & cache TTL (1 second cache to deduplicate simultaneous requests in same lambda)
let memoryStore: DatabaseSchema | null = null;
let lastSyncTimestamp = 0;
const CACHE_TTL_MS = 1000;

export function getDefaultData(): DatabaseSchema {
  return {
    content: initialSiteContent,
    video: initialVideoBackground,
    plans: initialPlans,
    paymentMethods: initialPaymentMethods,
    trainers: initialTrainers,
    programs: initialPrograms,
    members: initialMembers,
    bookings: initialBookings,
    media: initialMedia,
    settings: initialSiteSettings,
    testimonials: initialTestimonials,
    faqs: initialFAQs,
    adminCredentials: {
      username: 'admin',
      passwordHash: 'e3afed0047b08059d0fada10f400c1e5',
      email: 'admin@gymleno.com',
    },
  };
}

function getInitialFromDiskOrDefault(): DatabaseSchema {
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read LOCAL_DATA_PATH:', err);
  }

  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      const raw = fs.readFileSync(TMP_DATA_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read TMP_DATA_PATH:', err);
  }

  return getDefaultData();
}

/**
 * Reads database with versioned Vercel Blob cloud persistence.
 * Each write saves an immutable version (e.g. gym-db-<timestamp>.json)
 * which completely prevents any stale CDN edge caching.
 */
export async function readDatabase(forceFresh = false): Promise<DatabaseSchema> {
  const now = Date.now();
  if (!forceFresh && memoryStore && now - lastSyncTimestamp < CACHE_TTL_MS) {
    return memoryStore;
  }

  // 1. If Vercel Blob Token is available, fetch latest version from cloud
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_PREFIX });

      if (blobs && blobs.length > 0) {
        // Sort descending: newest uploaded blob first
        const sorted = blobs.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        const latestBlob = sorted[0];

        const res = await fetch(latestBlob.url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });

        if (res.ok) {
          const cloudData: DatabaseSchema = await res.json();
          if (cloudData && Array.isArray(cloudData.bookings)) {
            if (!cloudData.testimonials || !Array.isArray(cloudData.testimonials)) {
              cloudData.testimonials = initialTestimonials;
            }
            if (!cloudData.faqs || !Array.isArray(cloudData.faqs)) {
              cloudData.faqs = initialFAQs;
            }
            if (!cloudData.settings) {
              cloudData.settings = { ...initialSiteSettings };
            } else if (!cloudData.settings.genderSchedules) {
              cloudData.settings.genderSchedules = initialGenderSchedules;
            }
            memoryStore = cloudData;
            lastSyncTimestamp = now;
            return memoryStore;
          }
        }
      } else {
        // Blob does not exist yet on cloud store -> seed first version!
        const initial = getInitialFromDiskOrDefault();
        memoryStore = initial;
        lastSyncTimestamp = now;
        await saveDatabase(initial);
        return memoryStore;
      }
    } catch (err) {
      console.warn('Failed to read from Vercel Blob, falling back to disk/cache:', err);
    }
  }

  // 2. Return memoryStore if already populated
  if (memoryStore) {
    return memoryStore;
  }

  // 3. Disk fallback
  memoryStore = getInitialFromDiskOrDefault();
  lastSyncTimestamp = now;
  return memoryStore;
}

/**
 * Persists database to Vercel Blob as an immutable versioned snapshot.
 * Bypasses edge cache and cleans up older snapshots.
 */
export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  memoryStore = data;
  lastSyncTimestamp = Date.now();

  // 1. Persist to Vercel Blob cloud with immutable timestamped filename
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const versionedName = `${BLOB_PREFIX}${Date.now()}.json`;
      await put(versionedName, JSON.stringify(data, null, 2), {
        access: 'public',
        addRandomSuffix: false,
      });

      // Background cleanup: keep the latest 2 versions, delete older ones
      list({ prefix: BLOB_PREFIX })
        .then(({ blobs }) => {
          if (blobs && blobs.length > 2) {
            const sorted = blobs.sort(
              (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            const toDelete = sorted.slice(2).map((b) => b.url);
            if (toDelete.length > 0) {
              del(toDelete).catch(() => {});
            }
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Failed to upload database to Vercel Blob:', err);
    }
  }

  // 2. Persist to local disk if writable
  try {
    const dir = path.dirname(LOCAL_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // In read-only serverless lambdas, try writing to /tmp
    try {
      fs.writeFileSync(TMP_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
  }
}

// Content Get & Update
export async function getSiteContent(): Promise<SiteContent> {
  const db = await readDatabase();
  return db.content;
}

export async function updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const db = await readDatabase();
  db.content = { ...db.content, ...content };
  await saveDatabase(db);
  return db.content;
}

// Video Config
export async function getVideoConfig(): Promise<VideoBackgroundConfig> {
  const db = await readDatabase();
  return db.video;
}

export async function updateVideoConfig(config: Partial<VideoBackgroundConfig>): Promise<VideoBackgroundConfig> {
  const db = await readDatabase();
  db.video = { ...db.video, ...config };
  await saveDatabase(db);
  return db.video;
}

// Plans
export async function getPlans(): Promise<MembershipPlan[]> {
  const db = await readDatabase();
  return db.plans.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan | null> {
  const db = await readDatabase();
  const index = db.plans.findIndex((p) => p.id === id);
  if (index === -1) return null;
  db.plans[index] = { ...db.plans[index], ...updates };
  await saveDatabase(db);
  return db.plans[index];
}

export async function createPlan(plan: Omit<MembershipPlan, 'id'>): Promise<MembershipPlan> {
  const db = await readDatabase();
  const newPlan: MembershipPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
  };
  db.plans.push(newPlan);
  await saveDatabase(db);
  return newPlan;
}

export async function deletePlan(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLen = db.plans.length;
  db.plans = db.plans.filter((p) => p.id !== id);
  if (db.plans.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Payment Methods
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await readDatabase();
  return db.paymentMethods.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
  const db = await readDatabase();
  const index = db.paymentMethods.findIndex((pm) => pm.id === id);
  if (index === -1) return null;
  db.paymentMethods[index] = { ...db.paymentMethods[index], ...updates };
  await saveDatabase(db);
  return db.paymentMethods[index];
}

export async function togglePaymentMethod(id: string, isActive: boolean): Promise<PaymentMethod | null> {
  return updatePaymentMethod(id, { isActive });
}

// Trainers
export async function getTrainers(): Promise<Trainer[]> {
  const db = await readDatabase();
  return db.trainers;
}

export async function updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer | null> {
  const db = await readDatabase();
  const index = db.trainers.findIndex((t) => t.id === id);
  if (index === -1) return null;
  db.trainers[index] = { ...db.trainers[index], ...updates };
  await saveDatabase(db);
  return db.trainers[index];
}

export async function createTrainer(trainer: Omit<Trainer, 'id'>): Promise<Trainer> {
  const db = await readDatabase();
  const newTrainer: Trainer = {
    ...trainer,
    id: `trainer-${Date.now()}`,
  };
  db.trainers.push(newTrainer);
  await saveDatabase(db);
  return newTrainer;
}

export async function deleteTrainer(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLen = db.trainers.length;
  db.trainers = db.trainers.filter((t) => t.id !== id);
  if (db.trainers.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Programs
export async function getPrograms(): Promise<Program[]> {
  const db = await readDatabase();
  return db.programs;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<Program | null> {
  const db = await readDatabase();
  const index = db.programs.findIndex((p) => p.id === id);
  if (index === -1) return null;
  db.programs[index] = { ...db.programs[index], ...updates };
  await saveDatabase(db);
  return db.programs[index];
}

export async function createProgram(program: Omit<Program, 'id'>): Promise<Program> {
  const db = await readDatabase();
  const newProg: Program = {
    ...program,
    id: `prog-${Date.now()}`,
  };
  db.programs.push(newProg);
  await saveDatabase(db);
  return newProg;
}

export async function deleteProgram(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLen = db.programs.length;
  db.programs = db.programs.filter((p) => p.id !== id);
  if (db.programs.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Members
export async function getMembers(): Promise<Member[]> {
  const db = await readDatabase();
  return db.members;
}

export async function createMember(member: Omit<Member, 'id' | 'membershipCode'>): Promise<Member> {
  const db = await readDatabase();
  const codeNumber = Math.floor(10000 + Math.random() * 90000);
  const newMember: Member = {
    ...member,
    id: `mem-${Date.now()}`,
    membershipCode: `LENO-${codeNumber}`,
  };
  db.members.unshift(newMember);
  await saveDatabase(db);
  return newMember;
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
  const db = await readDatabase();
  const index = db.members.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.members[index] = { ...db.members[index], ...updates };
  await saveDatabase(db);
  return db.members[index];
}

export async function deleteMember(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLen = db.members.length;
  db.members = db.members.filter((m) => m.id !== id);
  if (db.members.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Bookings & Orders
export async function getBookings(forceFresh = false): Promise<BookingOrder[]> {
  const db = await readDatabase(forceFresh);
  return db.bookings.map((b) => {
    const plan = db.plans.find((p) => p.id === b.planId);
    const months = plan ? plan.durationMonths : 1;
    const startDate =
      b.startDate ||
      (b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    let endDate = b.endDate;
    if (!endDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + months);
        endDate = d.toISOString().split('T')[0];
      } else {
        endDate = startDate;
      }
    }
    return {
      ...b,
      startDate,
      endDate,
    };
  });
}

/**
 * Universal Real-time Inquiry: Searches both Members (db.members) and Bookings (db.bookings)
 * by Phone Number, Membership Code, or Order Code with flexible normalization.
 */
export async function lookupMembershipOrOrder(rawQuery: string): Promise<any[]> {
  const query = (rawQuery || '').trim();
  if (!query || query.length < 2) return [];

  const db = await readDatabase(true); // Always read fresh from cloud store!
  const cleanQ = query.toLowerCase().replace(/[\s\-_#:]/g, '');
  const digitsOnlyQ = query.replace(/[^0-9]/g, '');

  const results: any[] = [];
  const seenMemberPhones = new Set<string>();

  // 1. Check Members (db.members)
  const members = db.members || [];
  for (const m of members) {
    const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
    const cleanCode = (m.membershipCode || '').toLowerCase().replace(/[\s\-_#:]/g, '');

    const phoneMatch =
      digitsOnlyQ.length >= 6 &&
      (cleanPhone.includes(digitsOnlyQ) ||
        digitsOnlyQ.includes(cleanPhone) ||
        (cleanPhone.endsWith(digitsOnlyQ) && digitsOnlyQ.length >= 8) ||
        (digitsOnlyQ.endsWith(cleanPhone) && cleanPhone.length >= 8));

    const codeMatch =
      cleanCode === cleanQ ||
      cleanCode.includes(cleanQ) ||
      (digitsOnlyQ.length >= 4 && cleanCode.includes(digitsOnlyQ));

    if (phoneMatch || codeMatch) {
      seenMemberPhones.add(cleanPhone);
      const plan = db.plans.find((p) => p.id === m.planId);
      const trainer = db.trainers?.find((t) => t.id === m.trainerId);

      results.push({
        id: m.id,
        orderCode: m.membershipCode,
        membershipCode: m.membershipCode,
        customerName: m.fullName,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        planId: m.planId,
        planNameAr: plan?.nameAr || m.planId,
        planNameEn: plan?.name || m.planId,
        trainerId: m.trainerId,
        trainerNameAr: trainer?.nameAr,
        startDate: m.startDate,
        endDate: m.endDate,
        status: m.status || 'active',
        totalAmountEGP: plan?.priceEGP || 0,
        createdAt: m.startDate,
        isMember: true,
      });
    }
  }

  // 2. Check Bookings (db.bookings)
  const bookings = db.bookings || [];
  for (const b of bookings) {
    const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
    const cleanOrderCode = (b.orderCode || '').toLowerCase().replace(/[\s\-_#:]/g, '');

    const phoneMatch =
      digitsOnlyQ.length >= 6 &&
      (cleanPhone.includes(digitsOnlyQ) ||
        digitsOnlyQ.includes(cleanPhone) ||
        (cleanPhone.endsWith(digitsOnlyQ) && digitsOnlyQ.length >= 8) ||
        (digitsOnlyQ.endsWith(cleanPhone) && cleanPhone.length >= 8));

    const codeMatch =
      cleanOrderCode === cleanQ ||
      cleanOrderCode.includes(cleanQ) ||
      (digitsOnlyQ.length >= 4 && cleanOrderCode.includes(digitsOnlyQ));

    if (phoneMatch || codeMatch) {
      const alreadyHasCode = results.some((r) => r.orderCode === b.orderCode);
      if (!alreadyHasCode) {
        const plan = db.plans.find((p) => p.id === b.planId);
        const trainer = db.trainers?.find((t) => t.id === b.trainerId);
        const months = plan ? plan.durationMonths : 1;
        const startDate =
          b.startDate || (b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
        let endDate = b.endDate;
        if (!endDate) {
          const d = new Date(startDate);
          if (!isNaN(d.getTime())) {
            d.setMonth(d.getMonth() + months);
            endDate = d.toISOString().split('T')[0];
          } else {
            endDate = startDate;
          }
        }

        results.push({
          id: b.id,
          orderCode: b.orderCode,
          customerName: b.customerName,
          phone: b.phone,
          email: b.email,
          gender: b.gender,
          planId: b.planId,
          planNameAr: plan?.nameAr || b.planId,
          planNameEn: plan?.name || b.planId,
          trainerId: b.trainerId,
          trainerNameAr: trainer?.nameAr,
          preferredShift: b.preferredShift,
          startDate,
          endDate,
          status: b.status,
          totalAmountEGP: b.totalAmountEGP,
          proofImageUrl: b.proofImageUrl,
          adminNotes: b.adminNotes,
          createdAt: b.createdAt,
          isBooking: true,
        });
      }
    }
  }

  return results;
}

export async function createBooking(
  data: Omit<BookingOrder, 'id' | 'orderCode' | 'status' | 'createdAt'>
): Promise<BookingOrder> {
  const db = await readDatabase(true); // force fresh read to prevent race conditions
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const plan = db.plans.find((p) => p.id === data.planId);
  const months = plan ? plan.durationMonths : 1;
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + months);
  const startDate = data.startDate || start.toISOString().split('T')[0];
  const endDate = data.endDate || end.toISOString().split('T')[0];

  const newBooking: BookingOrder = {
    ...data,
    startDate,
    endDate,
    id: `book-${Date.now()}`,
    orderCode: `LENO-ORD-${randomSuffix}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.bookings.unshift(newBooking);
  await saveDatabase(db);
  return newBooking;
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  adminNotes?: string
): Promise<BookingOrder | null> {
  const db = await readDatabase(true); // force fresh read
  const index = db.bookings.findIndex((b) => b.id === id || b.orderCode === id);
  if (index === -1) return null;

  db.bookings[index].status = status;
  if (adminNotes !== undefined) {
    db.bookings[index].adminNotes = adminNotes;
  }

  // If approved, automatically create or activate member!
  if (status === 'approved') {
    const booking = db.bookings[index];
    const plan = db.plans.find((p) => p.id === booking.planId);
    const months = plan ? plan.durationMonths : 1;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    db.bookings[index].startDate = startDateStr;
    db.bookings[index].endDate = endDateStr;

    const codeNumber = Math.floor(10000 + Math.random() * 90000);
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      membershipCode: `LENO-${codeNumber}`,
      fullName: booking.customerName,
      gender: booking.gender,
      phone: booking.phone,
      email: booking.email,
      planId: booking.planId,
      trainerId: booking.trainerId,
      startDate: startDateStr,
      endDate: endDateStr,
      status: 'active',
      notes: `تم التفعيل تلقائياً من الطلب: ${booking.orderCode}`,
    };
    db.members.unshift(newMember);
  }

  await saveDatabase(db);
  return db.bookings[index];
}

export async function updateBooking(
  id: string,
  updates: Partial<BookingOrder>
): Promise<BookingOrder | null> {
  const db = await readDatabase(true);
  const index = db.bookings.findIndex((b) => b.id === id || b.orderCode === id);
  if (index === -1) return null;

  const prevBooking = db.bookings[index];
  const updatedBooking: BookingOrder = {
    ...prevBooking,
    ...updates,
  };

  // If status was changed to approved and wasn't before, ensure member exists
  if (updates.status === 'approved' && prevBooking.status !== 'approved') {
    const plan = db.plans.find((p) => p.id === (updatedBooking.planId || prevBooking.planId));
    const months = plan ? plan.durationMonths : 1;
    const startDate = updatedBooking.startDate || new Date().toISOString().split('T')[0];
    let endDate = updatedBooking.endDate;
    if (!endDate) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + months);
      endDate = d.toISOString().split('T')[0];
    }
    updatedBooking.startDate = startDate;
    updatedBooking.endDate = endDate;

    const codeNumber = Math.floor(10000 + Math.random() * 90000);
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      membershipCode: `LENO-${codeNumber}`,
      fullName: updatedBooking.customerName,
      gender: updatedBooking.gender,
      phone: updatedBooking.phone,
      email: updatedBooking.email,
      planId: updatedBooking.planId,
      trainerId: updatedBooking.trainerId,
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      notes: `تم التفعيل والتعديل للطلب: ${updatedBooking.orderCode}`,
    };
    db.members.unshift(newMember);
  }

  // Also update corresponding member dates if member exists with same phone or order note
  if (updates.startDate || updates.endDate || updates.customerName || updates.phone) {
    db.members = db.members.map((m) => {
      const matchOrder = m.notes && m.notes.includes(updatedBooking.orderCode);
      const matchPhone = m.phone === prevBooking.phone || m.phone === updatedBooking.phone;
      if (matchOrder || matchPhone) {
        return {
          ...m,
          fullName: updates.customerName || m.fullName,
          phone: updates.phone || m.phone,
          startDate: updates.startDate || m.startDate,
          endDate: updates.endDate || m.endDate,
          planId: updates.planId || m.planId,
          trainerId: updates.trainerId !== undefined ? updates.trainerId : m.trainerId,
        };
      }
      return m;
    });
  }

  db.bookings[index] = updatedBooking;
  await saveDatabase(db);
  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const db = await readDatabase(true);
  const target = db.bookings.find((b) => b.id === id || b.orderCode === id);
  if (!target) return false;

  db.bookings = db.bookings.filter((b) => b.id !== id && b.orderCode !== id);

  // Also remove any test member associated with this specific orderCode if notes match
  if (target.orderCode) {
    db.members = db.members.filter(
      (m) => !(m.notes && m.notes.includes(target.orderCode))
    );
  }

  await saveDatabase(db);
  return true;
}

// Media
export async function getMedia(): Promise<MediaItem[]> {
  const db = await readDatabase();
  return db.media;
}

export async function addMedia(item: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
  const db = await readDatabase();
  const newItem: MediaItem = {
    ...item,
    id: `med-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  db.media.unshift(newItem);
  await saveDatabase(db);
  return newItem;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLen = db.media.length;
  db.media = db.media.filter((m) => m.id !== id);
  if (db.media.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await readDatabase();
  if (!db.settings.genderSchedules) {
    db.settings.genderSchedules = initialGenderSchedules;
  }
  return db.settings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = await readDatabase();
  db.settings = { ...db.settings, ...settings };
  await saveDatabase(db);
  return db.settings;
}

// Dashboard statistics (Live Dynamic Calculation)
export async function getDashboardMetrics() {
  const db = await readDatabase();

  const membersList = db.members || [];
  const bookingsList = db.bookings || [];

  // Count active members accurately:
  // Combines active members in db.members and approved active subscribers in db.bookings
  // Uses normalized phone numbers to prevent duplicate counts
  const todayStr = new Date().toISOString().split('T')[0];
  const activeMembersSet = new Set<string>();

  for (const m of membersList) {
    if (m.status === 'expired') continue;
    if (m.endDate && m.endDate !== '—' && m.endDate < todayStr) continue;
    const key = (m.phone || '').replace(/[^0-9]/g, '') || m.membershipCode || m.id;
    if (key) activeMembersSet.add(key);
  }

  for (const b of bookingsList) {
    if (b.status !== 'approved') continue;
    if (b.endDate && b.endDate !== '—' && b.endDate < todayStr) continue;
    const key = (b.phone || '').replace(/[^0-9]/g, '') || b.orderCode || b.id;
    if (key) activeMembersSet.add(key);
  }

  const activeMembers = activeMembersSet.size;
  const totalMembers = Math.max(membersList.length, activeMembers);
  const expiredMembers = membersList.filter((m) => m.status === 'expired' || (m.endDate && m.endDate !== '—' && m.endDate < todayStr)).length;
  const expiringSoonMembers = membersList.filter((m) => m.status === 'expiring_soon').length;

  const pendingBookings = bookingsList.filter((b) => b.status === 'pending').length;
  const approvedBookings = bookingsList.filter((b) => b.status === 'approved').length;

  const totalRevenueEGP = bookingsList
    .filter((b) => b.status === 'approved')
    .reduce((sum, b) => sum + (b.totalAmountEGP || 0), 0);

  const testimonialsList = (db.testimonials && db.testimonials.length > 0)
    ? db.testimonials
    : initialTestimonials;

  const satisfactionRate = testimonialsList.length > 0
    ? Math.min(100, Math.round(
        (testimonialsList.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 5), 0) /
          (testimonialsList.length * 5)) * 100
      ))
    : 100;

  return {
    totalMembers,
    activeMembers,
    expiredMembers,
    expiringSoonMembers,
    pendingBookings,
    approvedBookings,
    totalRevenueEGP,
    trainersCount: (db.trainers || []).length,
    programsCount: (db.programs || []).length,
    plansCount: (db.plans || []).length,
    testimonialsCount: testimonialsList.length,
    satisfactionRate,
  };
}

// Testimonials CRUD
export async function getTestimonials(): Promise<Testimonial[]> {
  const db = await readDatabase();
  return db.testimonials || initialTestimonials;
}

export async function createTestimonial(testimonialData: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const db = await readDatabase();
  const newTestimonial: Testimonial = {
    ...testimonialData,
    id: `testi-${Date.now()}`,
    createdAt: testimonialData.createdAt || new Date().toISOString().split('T')[0],
  };
  if (!db.testimonials) db.testimonials = [...initialTestimonials];
  db.testimonials.unshift(newTestimonial);
  await saveDatabase(db);
  return newTestimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
  const db = await readDatabase();
  if (!db.testimonials) db.testimonials = [...initialTestimonials];
  const index = db.testimonials.findIndex((t) => t.id === id);
  if (index === -1) return null;

  db.testimonials[index] = { ...db.testimonials[index], ...updates };
  await saveDatabase(db);
  return db.testimonials[index];
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const db = await readDatabase();
  if (!db.testimonials) db.testimonials = [...initialTestimonials];
  const initialLen = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  if (db.testimonials.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// FAQs CRUD
export async function getFAQs(): Promise<FAQItem[]> {
  const db = await readDatabase();
  return db.faqs || initialFAQs;
}

export async function createFAQ(faqData: Omit<FAQItem, 'id'>): Promise<FAQItem> {
  const db = await readDatabase();
  if (!db.faqs) db.faqs = [...initialFAQs];
  const newFAQ: FAQItem = {
    ...faqData,
    id: `faq-${Date.now()}`,
    sortOrder: faqData.sortOrder ?? db.faqs.length + 1,
    isActive: faqData.isActive !== false,
  };
  db.faqs.push(newFAQ);
  await saveDatabase(db);
  return newFAQ;
}

export async function updateFAQ(id: string, updates: Partial<FAQItem>): Promise<FAQItem | null> {
  const db = await readDatabase();
  if (!db.faqs) db.faqs = [...initialFAQs];
  const index = db.faqs.findIndex((f) => f.id === id);
  if (index === -1) return null;

  db.faqs[index] = { ...db.faqs[index], ...updates };
  await saveDatabase(db);
  return db.faqs[index];
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const db = await readDatabase();
  if (!db.faqs) db.faqs = [...initialFAQs];
  const initialLen = db.faqs.length;
  db.faqs = db.faqs.filter((f) => f.id !== id);
  if (db.faqs.length !== initialLen) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// WhatsApp Automation & Subscription Reminders
import {
  formatEgyptianPhoneForWhatsApp,
  calculateDaysRemaining,
  buildWhatsAppReminderMessage,
} from './whatsapp';

export {
  formatEgyptianPhoneForWhatsApp,
  calculateDaysRemaining,
  buildWhatsAppReminderMessage,
};

export async function getMembersExpiringSoon(daysThreshold = 4) {
  const db = await readDatabase();
  const members = db.members || [];
  const plans = db.plans || [];

  return members
    .map((member) => {
      const daysRemaining = calculateDaysRemaining(member.endDate);
      const plan = plans.find((p) => p.id === member.planId);
      const planName = plan ? plan.nameAr : 'اشتراك جيم';
      return {
        ...member,
        daysRemaining,
        planName,
        isExpiringSoon: daysRemaining <= daysThreshold && daysRemaining >= 0 && member.status !== 'expired',
        isExpired: daysRemaining < 0 || member.status === 'expired',
        whatsAppPhone: formatEgyptianPhoneForWhatsApp(member.phone),
      };
    })
    .filter((m) => m.daysRemaining <= daysThreshold && m.daysRemaining >= 0 && m.status !== 'expired')
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export async function recordMemberReminderSent(memberId: string): Promise<boolean> {
  const db = await readDatabase();
  const index = db.members.findIndex((m) => m.id === memberId);
  if (index === -1) return false;

  db.members[index].lastReminderSentAt = new Date().toISOString();
  db.members[index].status = 'expiring_soon';
  await saveDatabase(db);
  return true;
}

export async function runAutomatedRemindersCheck(customDaysThreshold?: number) {
  const db = await readDatabase();
  const config = db.settings.reminderConfig || {
    enabled: true,
    daysThreshold: 4,
    messageTemplate: '',
    provider: 'direct_link',
  };

  const threshold = customDaysThreshold ?? config.daysThreshold ?? 4;
  const expiringMembers = await getMembersExpiringSoon(threshold);

  const results: any[] = [];

  for (const member of expiringMembers) {
    const formattedMsg = buildWhatsAppReminderMessage(
      member,
      member.planName,
      member.daysRemaining,
      config.messageTemplate
    );
    const waUrl = `https://wa.me/${member.whatsAppPhone}?text=${encodeURIComponent(formattedMsg)}`;

    let sentViaApi = false;
    let apiError = null;

    if (config.enabled && config.provider === 'ultramsg' && config.ultramsgInstanceId && config.ultramsgToken) {
      try {
        const apiRes = await fetch(
          `https://api.ultramsg.com/${config.ultramsgInstanceId}/messages/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: config.ultramsgToken,
              to: member.whatsAppPhone,
              body: formattedMsg,
            }),
          }
        );
        const apiData = await apiRes.json();
        if (apiData?.sent === 'true' || apiData?.id) {
          sentViaApi = true;
        } else {
          apiError = apiData?.message || 'UltraMsg failed';
        }
      } catch (e: any) {
        apiError = e.message;
      }
    }

    await recordMemberReminderSent(member.id);

    results.push({
      memberId: member.id,
      memberName: member.fullName,
      phone: member.phone,
      whatsAppPhone: member.whatsAppPhone,
      daysRemaining: member.daysRemaining,
      endDate: member.endDate,
      messagePreview: formattedMsg,
      whatsAppLink: waUrl,
      sentViaApi,
      apiError,
    });
  }

  return {
    scannedAt: new Date().toISOString(),
    totalMembers: db.members.length,
    thresholdDays: threshold,
    expiringMembersCount: expiringMembers.length,
    reminders: results,
  };
}

