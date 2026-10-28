'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Video,
  CreditCard,
  Smartphone,
  Users,
  Receipt,
  Dumbbell,
  PhoneCall,
  Share2,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Save,
  Search,
  Check,
  AlertCircle,
  Copy,
  Menu,
  X,
  Upload,
  RefreshCw,
  Film,
  Camera,
  Play,
  Sparkles,
  Loader2,
  MessageSquareQuote,
  Star,
  User,
  HelpCircle,
  BellRing,
  Send,
  MessageSquare,
  QrCode,
  Download,
  FileDown,
  Printer,
} from 'lucide-react';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import TrainerModal from '@/components/admin/TrainerModal';
import ProgramModal from '@/components/admin/ProgramModal';
import TestimonialModal from '@/components/admin/TestimonialModal';
import FAQModal from '@/components/admin/FAQModal';
import EditBookingModal from '@/components/admin/EditBookingModal';
import {
  formatEgyptianPhoneForWhatsApp,
  calculateDaysRemaining,
  buildWhatsAppReminderMessage,
} from '@/lib/whatsapp';
import { THEME_COLOR_PRESETS, applyThemeColor } from '@/lib/theme';
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
  WhatsAppReminderConfig,
} from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('metrics');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States
  const [metrics, setMetrics] = useState<any>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [video, setVideo] = useState<VideoBackgroundConfig | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Testimonial modal state
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // FAQ modal & search state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // WhatsApp Auto-Reminders state
  const [reminderConfig, setReminderConfig] = useState<WhatsAppReminderConfig>({
    enabled: true,
    daysThreshold: 4,
    messageTemplate: 'مرحباً كابتن {الاسم} 💪\nنود تذكيرك من إدارة GYM & LENO بأن اشتراكك ({الباقة}) متبقي عليه {الأيام_المتبقية} أيام وسينتهي بتاريخ {تاريخ_الانتهاء}.\n\nفخورون بالتزامك ونتائجك معنا! لتجديد اشتراكك والحفاظ على استمرارية تدريبك دون انقطاع، يمكنك التجديد الآن عبر الرابط:\nhttps://gym-leno.vercel.app/#pricing\n\nأو يمكنك الرد مباشرة على هذه المحادثة لتأكيد التجديد.\nدمت قوياً وموفقاً! 🏋️‍♂️\nفريق GYM & LENO',
    provider: 'direct_link',
  });
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [reminderScanLoading, setReminderScanLoading] = useState(false);
  const [savingReminderConfig, setSavingReminderConfig] = useState(false);
  const [testReminderPhone, setTestReminderPhone] = useState('');

  // Members search & filter
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilterStatus, setMemberFilterStatus] = useState('all');

  // Bookings filter & proof preview modal
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [previewProofBooking, setPreviewProofBooking] = useState<BookingOrder | null>(null);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingOrder | null>(null);

  // New Media Item modal
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');

  // New Member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPlanId, setNewMemberPlanId] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');

  // Media filter and upload state
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [uploadingMediaFile, setUploadingMediaFile] = useState(false);

  // Trainer modal state
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Program modal state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Media Picker modal state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'all' | 'video' | 'image'>('all');
  const [mediaPickerTitle, setMediaPickerTitle] = useState('اختيار من مكتبة الوسائط');
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [
        resMetrics,
        resContent,
        resVideo,
        resPlans,
        resPayments,
        resMembers,
        resBookings,
        resTrainers,
        resPrograms,
        resTestimonials,
        resFaqs,
        resMedia,
        resSettings,
        resReminders,
      ] = await Promise.all([
        fetch(`/api/metrics?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/content?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/video?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/plans?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/payment-methods?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/members?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/bookings?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/trainers?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/programs?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/testimonials?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/faqs?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/media?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/settings?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/automation/reminders?t=${ts}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
      ]);

      if (resMetrics?.data) setMetrics(resMetrics.data);
      if (resContent?.data) setContent(resContent.data);
      if (resVideo?.data) setVideo(resVideo.data);
      if (resPlans?.data) setPlans(resPlans.data);
      if (resPayments?.data) setPaymentMethods(resPayments.data);
      if (resMembers?.data) setMembers(resMembers.data);
      if (resBookings?.data) setBookings(resBookings.data);
      if (resTrainers?.data) setTrainers(resTrainers.data);
      if (resPrograms?.data) setPrograms(resPrograms.data);
      if (resTestimonials?.data) setTestimonials(resTestimonials.data);
      if (resFaqs?.data) setFaqs(resFaqs.data);
      if (resMedia?.data) setMedia(resMedia.data);
      if (resSettings?.data) {
        setSettings(resSettings.data);
        if (resSettings.data.accentColor) {
          applyThemeColor(resSettings.data.accentColor);
        }
      }
      if (resReminders?.data) setExpiringMembers(resReminders.data);
      if (resReminders?.config) setReminderConfig(resReminders.config);
      else if (resSettings?.data?.reminderConfig) setReminderConfig(resSettings.data.reminderConfig);
    } catch (err) {
      console.error('Error loading admin data', err);
      showToast('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
  };

  // 1. Save Content
  const handleSaveContent = async () => {
    if (!content) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ محتوى الموقع بنجاح');
      }
    } catch (err) {
      showToast('فشل حفظ المحتوى');
    } finally {
      setSaveLoading(false);
    }
  };

  // 2. Save Video Config
  const handleSaveVideo = async () => {
    if (!video) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ إعدادات الفيديو الخلفي بنجاح');
      }
    } catch (err) {
      showToast('فشل حفظ إعدادات الفيديو');
    } finally {
      setSaveLoading(false);
    }
  };

  // 3. Update Plan Price
  const handleUpdatePlan = async (id: string, updates: Partial<MembershipPlan>) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans(plans.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        showToast('تم تحديث الباقة بنجاح');
      }
    } catch (err) {
      showToast('فشل تحديث الباقة');
    }
  };

  // 4. Toggle Payment Method
  const handleTogglePayment = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(paymentMethods.map((pm) => (pm.id === id ? { ...pm, isActive } : pm)));
        showToast('تم تحديث حالة طريقة الدفع');
      }
    } catch (err) {
      showToast('فشل تحديث طريقة الدفع');
    }
  };

  // 5. Update Payment Method details (wallet number, instructions)
  const handleUpdatePaymentDetails = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(paymentMethods.map((pm) => (pm.id === id ? { ...pm, ...updates } : pm)));
        showToast('تم حفظ بيانات طريقة الدفع');
      }
    } catch (err) {
      showToast('فشل حفظ طريقة الدفع');
    }
  };

  // 6. Approve / Reject Booking
  const handleUpdateBookingStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map((b) => (b.id === id ? { ...b, status, adminNotes: notes } : b)));
        showToast(status === 'approved' ? 'تم اعتماد الطلب وتفعيل العضوية تلقائياً' : 'تم رفض الطلب');
        // reload metrics and members
        loadAllData();
      }
    } catch (err) {
      showToast('فشل تحديث حالة الطلب');
    }
  };

  // 6b. Open & Save Edit Booking
  const handleOpenEditBooking = (booking: BookingOrder) => {
    setEditingBooking(booking);
    setShowEditBookingModal(true);
  };

  const handleSaveBookingEdit = async (payload: Partial<BookingOrder> & { id: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ تعديلات الطلب وتحديث بيانات الاشتراك بنجاح');
        await loadAllData();
        return true;
      } else {
        showToast(data.error || 'فشل حفظ التعديلات');
        return false;
      }
    } catch (err) {
      console.error('Error saving booking edit:', err);
      showToast('حدث خطأ أثناء تعديل الطلب');
      return false;
    }
  };

  // 6c. Delete Booking
  const handleDeleteBooking = async (id: string, customerName?: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً${customerName ? ` الخاص بالكابتن (${customerName})` : ''}؟`)) return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        showToast('تم حذف الطلب بنجاح');
        await loadAllData();
      } else {
        showToast(data.error || 'فشل حذف الطلب');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      showToast('حدث خطأ أثناء حذف الطلب');
    }
  };

  // 7. Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;

    try {
      const plan = plans.find((p) => p.id === newMemberPlanId) || plans[0];
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + (plan ? plan.durationMonths : 1));

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newMemberName,
          phone: newMemberPhone,
          email: newMemberEmail,
          planId: plan.id,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          status: 'active',
          notes: 'عضو مسجل يدوياً من لوحة الإدارة',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMembers([data.data, ...members]);
        setShowAddMemberModal(false);
        setNewMemberName('');
        setNewMemberPhone('');
        setNewMemberEmail('');
        showToast('تم إضافة العضو بنجاح');
      }
    } catch (err) {
      showToast('فشل إضافة العضو');
    }
  };

  // 8. Delete Member
  const handleDeleteMember = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا العضو؟')) return;
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMembers(members.filter((m) => m.id !== id));
        showToast('تم حذف العضو');
      }
    } catch (err) {
      showToast('فشل حذف العضو');
    }
  };

  // 9. Add Media Item
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl || !newMediaName) return;

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newMediaUrl,
          name: newMediaName,
          type: newMediaType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMedia([data.data, ...media]);
        setNewMediaUrl('');
        setNewMediaName('');
        showToast('تم إضافة الوسيط إلى المكتبة');
      }
    } catch (err) {
      showToast('فشل إضافة الوسيط');
    }
  };

  // 10. Delete Media
  const handleDeleteMedia = async (id: string) => {
    if (!confirm('حذف هذا الملف من المكتبة؟')) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMedia(media.filter((m) => m.id !== id));
        showToast('تم حذف الملف');
      }
    } catch (err) {
      showToast('فشل حذف الملف');
    }
  };

  // 10.1 Direct File Upload to Cloud Storage
  const handleUploadFile = async (file: File, customName?: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customName) formData.append('name', customName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل رفع الملف');
      }

      showToast('تم رفع الملف بنجاح وحفظه في التخزين!');
      if (data.data) {
        setMedia((prev) => [data.data, ...prev]);
      }
      return data.url;
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء رفع الملف');
      return null;
    }
  };

  const openMediaPicker = (
    type: 'all' | 'video' | 'image',
    title: string,
    callback: (url: string) => void
  ) => {
    setMediaPickerType(type);
    setMediaPickerTitle(title);
    setMediaPickerCallback(() => callback);
    setShowMediaPicker(true);
  };

  // 10.2 Trainer CRUD Handlers
  const handleSaveTrainer = async (payload: any): Promise<boolean> => {
    try {
      if (payload.id) {
        const res = await fetch('/api/trainers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTrainers(trainers.map((t) => (t.id === payload.id ? data.data : t)));
          showToast('تم حفظ تعديلات المدرب بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل تعديل المدرب');
          return false;
        }
      } else {
        const res = await fetch('/api/trainers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTrainers([...trainers, data.data]);
          showToast('تمت إضافة المدرب الجديد بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل إضافة المدرب');
          return false;
        }
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ المدرب');
      return false;
    }
  };

  const handleDeleteTrainer = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المدرب (${name})؟`)) return;
    try {
      const res = await fetch(`/api/trainers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTrainers(trainers.filter((t) => t.id !== id));
        showToast('تم حذف المدرب بنجاح');
      } else {
        showToast(data.error || 'فشل حذف المدرب');
      }
    } catch {
      showToast('حدث خطأ أثناء حذف المدرب');
    }
  };

  // 10.3 Program CRUD Handlers
  const handleSaveProgram = async (payload: any): Promise<boolean> => {
    try {
      if (payload.id) {
        const res = await fetch('/api/programs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setPrograms(programs.map((p) => (p.id === payload.id ? data.data : p)));
          showToast('تم حفظ تعديلات البرنامج بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل تعديل البرنامج');
          return false;
        }
      } else {
        const res = await fetch('/api/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setPrograms([...programs, data.data]);
          showToast('تمت إضافة البرنامج التدريبي بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل إضافة البرنامج');
          return false;
        }
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ البرنامج');
      return false;
    }
  };

  const handleDeleteProgram = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف البرنامج (${title})؟`)) return;
    try {
      const res = await fetch(`/api/programs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPrograms(programs.filter((p) => p.id !== id));
        showToast('تم حذف البرنامج بنجاح');
      } else {
        showToast(data.error || 'فشل حذف البرنامج');
      }
    } catch {
      showToast('حدث خطأ أثناء حذف البرنامج');
    }
  };

  // 10.4 Testimonials CRUD Handlers
  const handleSaveTestimonial = async (payload: any): Promise<boolean> => {
    try {
      if (payload.id) {
        const res = await fetch('/api/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTestimonials(testimonials.map((t) => (t.id === payload.id ? data.data : t)));
          showToast('تم حفظ تعديل رأي المشترك بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل تعديل التقييم');
          return false;
        }
      } else {
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTestimonials([data.data, ...testimonials]);
          showToast('تمت إضافة رأي المشترك بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل إضافة التقييم');
          return false;
        }
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ التقييم');
      return false;
    }
  };

  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف رأي المشترك (${name})؟`)) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        showToast('تم حذف التقييم بنجاح');
      } else {
        showToast(data.error || 'فشل حذف التقييم');
      }
    } catch {
      showToast('حدث خطأ أثناء حذف التقييم');
    }
  };

  // 10.5 FAQs CRUD Handlers
  const handleSaveFaq = async (payload: any): Promise<boolean> => {
    try {
      if (payload.id) {
        const res = await fetch('/api/faqs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setFaqs(faqs.map((f) => (f.id === payload.id ? data.data : f)));
          showToast('تم حفظ تعديل السؤال والإجابة بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل تحديث السؤال');
          return false;
        }
      } else {
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setFaqs([...faqs, data.data]);
          showToast('تمت إضافة السؤال والإجابة بنجاح');
          return true;
        } else {
          showToast(data.error || 'فشل إضافة السؤال');
          return false;
        }
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ السؤال');
      return false;
    }
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف هذا السؤال؟\n"${question}"`)) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFaqs(faqs.filter((f) => f.id !== id));
        showToast('تم حذف السؤال بنجاح');
      } else {
        showToast(data.error || 'فشل حذف السؤال');
      }
    } catch {
      showToast('حدث خطأ أثناء حذف السؤال');
    }
  };

  const handleToggleFaqActive = async (faq: FAQItem) => {
    const updated = { ...faq, isActive: !(faq.isActive !== false) };
    try {
      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(faqs.map((f) => (f.id === faq.id ? data.data : f)));
        showToast(updated.isActive ? 'تم تفعيل ظهور السؤال في الموقع' : 'تم إخفاء السؤال من الموقع');
      } else {
        showToast('تعذر تغيير حالة السؤال');
      }
    } catch {
      showToast('حدث خطأ في الاتصال');
    }
  };

  // 10.6 WhatsApp Reminders Handlers
  const handleSaveReminderConfig = async () => {
    setSavingReminderConfig(true);
    try {
      const res = await fetch('/api/automation/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderConfig),
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ إعدادات وقالب رسالة التذكير بنجاح');
      } else {
        showToast(data.error || 'فشل حفظ الإعدادات');
      }
    } catch {
      showToast('حدث خطأ في الاتصال');
    } finally {
      setSavingReminderConfig(false);
    }
  };

  const handleScanReminders = async () => {
    setReminderScanLoading(true);
    try {
      const ts = Date.now();
      const res = await fetch(`/api/automation/reminders?days=${reminderConfig.daysThreshold || 4}&t=${ts}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setExpiringMembers(data.data || []);
        showToast(`تم فحص الاشتراكات: ${data.count} مشترك متبقي لهم ${data.threshold} أيام أو أقل`);
      } else {
        showToast(data.error || 'فشل فحص التنبيهات');
      }
    } catch {
      showToast('حدث خطأ أثناء فحص الاشتراكات');
    } finally {
      setReminderScanLoading(false);
    }
  };

  const handleSendReminderToMember = async (member: any) => {
    try {
      await fetch('/api/automation/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const nowIso = new Date().toISOString();
      setExpiringMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, lastReminderSentAt: nowIso } : m))
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, lastReminderSentAt: nowIso } : m))
      );
      showToast(`جاري فتح محادثة الواتساب للمشترك (${member.fullName})...`);
    } catch {}

    const waPhone = member.whatsAppPhone || formatEgyptianPhoneForWhatsApp(member.phone);
    const planName = plans.find((p) => p.id === member.planId)?.nameAr || 'الاشتراك الحالي';
    const daysRemaining = member.daysRemaining ?? calculateDaysRemaining(member.endDate);
    const msg =
      member.messagePreview ||
      buildWhatsAppReminderMessage(reminderConfig.messageTemplate, {
        fullName: member.fullName,
        planName,
        daysRemaining,
        endDate: member.endDate,
        membershipCode: member.membershipCode,
      });

    const url = member.whatsAppUrl || `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleTestWhatsAppMessage = () => {
    if (!testReminderPhone.trim()) {
      showToast('يرجى كتابة رقم الهاتف للتجربة أولاً');
      return;
    }
    const cleanPhone = testReminderPhone.replace(/[^0-9]/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      finalPhone = '20' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
      finalPhone = '20' + cleanPhone;
    }

    const testMsg = (reminderConfig.messageTemplate || '')
      .replace(/{الاسم}/g, 'أحمد (تجريبي)')
      .replace(/{الباقة}/g, 'باقة 3 شهور VIP')
      .replace(/{الأيام_المتبقية}/g, `${reminderConfig.daysThreshold || 4} أيام`)
      .replace(/{تاريخ_الانتهاء}/g, '2026-10-30')
      .replace(/{كود_العضوية}/g, 'LENO-TEST-99')
      .replace(/{رابط_الموقع}/g, 'https://gym-leno.vercel.app/#pricing');

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(testMsg)}`;
    window.open(url, '_blank');
  };

  // 11. Save Settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        if (settings.accentColor) {
          applyThemeColor(settings.accentColor);
        }
        showToast('تم حفظ إعدادات الهوية والتصميم بنجاح وتطبيق اللون فوراً');
      }
    } catch (err) {
      showToast('فشل حفظ الإعدادات');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateShift = (
    genderGroup: 'men' | 'women',
    index: number,
    field: 'labelAr' | 'timeRangeAr',
    value: string
  ) => {
    if (!settings) return;
    const currentSchedules = settings.genderSchedules || {
      men: [
        { id: 'm1', labelAr: 'الصباحية (رجال)', labelEn: 'Morning', timeRangeAr: '06:00 ص – 10:00 ص', timeRangeEn: '06:00 AM – 10:00 AM' },
        { id: 'm2', labelAr: 'الظهيرة (رجال)', labelEn: 'Afternoon', timeRangeAr: '02:00 م – 06:00 م', timeRangeEn: '02:00 PM – 06:00 PM' },
        { id: 'm3', labelAr: 'المسائية (رجال)', labelEn: 'Evening', timeRangeAr: '06:00 م – 12:00 ص', timeRangeEn: '06:00 PM – 12:00 AM' },
      ],
      women: [
        { id: 'w1', labelAr: 'الصباحية (سيدات فقط)', labelEn: 'Morning', timeRangeAr: '10:00 ص – 02:00 م', timeRangeEn: '10:00 AM – 02:00 PM' },
        { id: 'w2', labelAr: 'ما بعد الظهر (سيدات فقط)', labelEn: 'Afternoon', timeRangeAr: '03:00 م – 06:00 م', timeRangeEn: '03:00 PM – 06:00 PM' },
        { id: 'w3', labelAr: 'المسائية (سيدات فقط)', labelEn: 'Evening', timeRangeAr: '08:00 م – 11:00 م', timeRangeEn: '08:00 PM – 11:00 PM' },
      ],
    };

    const targetList = [...(currentSchedules[genderGroup] || [])];
    if (targetList[index]) {
      targetList[index] = { ...targetList[index], [field]: value };
    }

    setSettings({
      ...settings,
      genderSchedules: {
        ...currentSchedules,
        [genderGroup]: targetList,
      },
    });
  };

  const handleAddShift = (genderGroup: 'men' | 'women') => {
    if (!settings) return;
    const currentSchedules = settings.genderSchedules || {
      men: [
        { id: 'm1', labelAr: 'الصباحية (رجال)', labelEn: 'Morning', timeRangeAr: '06:00 ص – 10:00 ص', timeRangeEn: '06:00 AM – 10:00 AM' },
        { id: 'm2', labelAr: 'الظهيرة (رجال)', labelEn: 'Afternoon', timeRangeAr: '02:00 م – 06:00 م', timeRangeEn: '02:00 PM – 06:00 PM' },
        { id: 'm3', labelAr: 'المسائية (رجال)', labelEn: 'Evening', timeRangeAr: '06:00 م – 12:00 ص', timeRangeEn: '06:00 PM – 12:00 AM' },
      ],
      women: [
        { id: 'w1', labelAr: 'الصباحية (سيدات فقط)', labelEn: 'Morning', timeRangeAr: '10:00 ص – 02:00 م', timeRangeEn: '10:00 AM – 02:00 PM' },
        { id: 'w2', labelAr: 'ما بعد الظهر (سيدات فقط)', labelEn: 'Afternoon', timeRangeAr: '03:00 م – 06:00 م', timeRangeEn: '03:00 PM – 06:00 PM' },
        { id: 'w3', labelAr: 'المسائية (سيدات فقط)', labelEn: 'Evening', timeRangeAr: '08:00 م – 11:00 م', timeRangeEn: '08:00 PM – 11:00 PM' },
      ],
    };
    const targetList = [...(currentSchedules[genderGroup] || [])];
    const newId = `${genderGroup}-${Date.now()}`;
    targetList.push({
      id: newId,
      labelAr: genderGroup === 'men' ? 'فترة إضافية للرجال' : 'فترة إضافية للسيدات',
      labelEn: genderGroup === 'men' ? 'New Men Shift' : 'New Ladies Shift',
      timeRangeAr: '04:00 م – 07:00 م',
      timeRangeEn: '04:00 PM – 07:00 PM',
    });
    setSettings({
      ...settings,
      genderSchedules: {
        ...currentSchedules,
        [genderGroup]: targetList,
      },
    });
    showToast('تمت إضافة فترة تدريب جديدة. اضغط حفظ لتطبيقها في نافذة الحجز');
  };

  const handleDeleteShift = (genderGroup: 'men' | 'women', index: number) => {
    if (!settings) return;
    const currentSchedules = settings.genderSchedules || {
      men: [],
      women: [],
    };
    const targetList = [...(currentSchedules[genderGroup] || [])];
    targetList.splice(index, 1);
    setSettings({
      ...settings,
      genderSchedules: {
        ...currentSchedules,
        [genderGroup]: targetList,
      },
    });
    showToast('تم حذف الفترة. اضغط حفظ لتأكيد التغيير');
  };

  const getBookingSubscriptionDates = (b: BookingOrder) => {
    const plan = plans.find((p) => p.id === b.planId);
    const months = plan?.durationMonths || 1;
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
        endDate = '—';
      }
    }
    let daysLeft: number | null = null;
    if (endDate && endDate !== '—') {
      const endD = new Date(endDate);
      const nowD = new Date();
      nowD.setHours(0, 0, 0, 0);
      endD.setHours(0, 0, 0, 0);
      daysLeft = Math.ceil((endD.getTime() - nowD.getTime()) / (1000 * 60 * 60 * 24));
    }
    return { startDate, endDate, daysLeft };
  };

  const navItems = [
    { id: 'metrics', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'content', label: 'محتوى الموقع', icon: FileText },
    { id: 'media', label: 'مكتبة الصور والفيديوهات', icon: ImageIcon },
    { id: 'video', label: 'خلفيات الفيديو', icon: Video },
    { id: 'plans', label: 'الاشتراكات والأسعار', icon: CreditCard },
    { id: 'payments', label: 'طرق الدفع المصرية', icon: Smartphone },
    { id: 'members', label: 'إدارة الأعضاء', icon: Users },
    { id: 'reminders', label: 'تذكير الواتساب الذاتي (4 أيام)', icon: BellRing },
    { id: 'qrcode', label: 'رمز QR للموقع (دائم مدى الحياة)', icon: QrCode },
    { id: 'bookings', label: 'المدفوعات والطلبات', icon: Receipt },
    { id: 'programs', label: 'البرامج والمدربون', icon: Dumbbell },
    { id: 'testimonials', label: 'آراء المشتركين والتحولات', icon: MessageSquareQuote },
    { id: 'faqs', label: 'الأسئلة الشائعة والأجوبة', icon: HelpCircle },
    { id: 'contact', label: 'مواعيد العمل وفترات التدريب', icon: PhoneCall },
    { id: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
    { id: 'settings', label: 'إعدادات الموقع', icon: Settings },
    { id: 'security', label: 'الحساب والأمان', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-gym-950 overflow-hidden font-arabic">
      
      {/* Toast Notification Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gym-lime text-black font-extrabold text-sm shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-5 h-5 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile & Tablet Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-gym-900 border-l border-white/10 shadow-2xl flex flex-col z-50 animate-fade-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gym-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black">
                  <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white font-display uppercase tracking-wider">
                    GYM & LENO
                  </h2>
                  <span className="text-[10px] text-gym-lime font-bold">لوحة الإدارة</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-start ${
                      isActive
                        ? 'bg-gym-lime text-black shadow-lg shadow-gym-lime/20 font-black'
                        : 'text-gray-400 hover:text-white hover:bg-gym-850'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-gym-lime'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/10 space-y-2 bg-gym-950">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gym-850 hover:bg-gym-800 text-gray-300 hover:text-white text-xs font-bold transition-colors border border-white/5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>عرض الموقع المباشر</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-gym-900 border-l border-white/10 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display uppercase tracking-wider">
                GYM & LENO
              </h2>
              <span className="text-[10px] text-gym-lime font-bold">لوحة الإدارة الشاملة</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gym-lime text-black shadow-lg shadow-gym-lime/20 font-black'
                    : 'text-gray-400 hover:text-white hover:bg-gym-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gym-lime'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gym-850 hover:bg-gym-800 text-gray-300 hover:text-white text-xs font-bold transition-colors border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>عرض الموقع المباشر</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-gym-900 border-b border-white/10 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gym-850 text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-black text-white">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-gym-850 hover:bg-gym-800 text-gray-300 hover:text-gym-lime transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gym-850 border border-white/5 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-300 font-bold">متصل بالسيرفر والبيانات</span>
            </div>
          </div>
        </header>

        {/* Tab Body View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gym-950">
          
          {/* TAB 1: الرئيسية والإحصائيات */}
          {activeTab === 'metrics' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 relative overflow-hidden">
                  <div className="text-xs text-gray-400 font-bold mb-1">إجمالي الأعضاء</div>
                  <div className="text-3xl font-black text-white font-display">
                    {members.length}
                  </div>
                  <div className="text-[11px] text-green-400 font-bold mt-2">
                    {members.filter((m) => m.status === 'active').length} عضو نشط حالياً
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 relative overflow-hidden">
                  <div className="text-xs text-gray-400 font-bold mb-1">الطلبات المعلقة</div>
                  <div className="text-3xl font-black text-yellow-400 font-display">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    تحتاج إلى مراجعة إشعار الدفع
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 relative overflow-hidden">
                  <div className="text-xs text-gray-400 font-bold mb-1">إجمالي المبيعات والمدفوعات</div>
                  <div className="text-3xl font-black text-gym-lime font-display">
                    {bookings
                      .filter((b) => b.status === 'approved')
                      .reduce((sum, b) => sum + b.totalAmountEGP, 0)
                      .toLocaleString()}{' '}
                    <span className="text-xs">ج.م</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">المدفوعات المعتمدة</div>
                </div>

                <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 relative overflow-hidden">
                  <div className="text-xs text-gray-400 font-bold mb-1">تنتهي قريباً (خلال أسبوع)</div>
                  <div className="text-3xl font-black text-orange-400 font-display">
                    {members.filter((m) => m.status === 'expiring_soon').length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">جاهزة لإرسال عرض التجديد</div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white">أحدث طلبات الاشتراك والحجز</h3>
                    <p className="text-xs text-gray-400">راجع إشعارات الدفع المصرية واعتمد التفعيل</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-gym-lime hover:underline"
                  >
                    عرض جميع الطلبات ({bookings.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="pb-3 font-bold">كود الطلب</th>
                        <th className="pb-3 font-bold">الاسم</th>
                        <th className="pb-3 font-bold">رقم الهاتف</th>
                        <th className="pb-3 font-bold">الباقة</th>
                        <th className="pb-3 font-bold">تاريخ الاشتراك</th>
                        <th className="pb-3 font-bold">تاريخ الانتهاء</th>
                        <th className="pb-3 font-bold">طريقة الدفع</th>
                        <th className="pb-3 font-bold">إشعار وسكرين شوت التحويل</th>
                        <th className="pb-3 font-bold">المبلغ</th>
                        <th className="pb-3 font-bold">الحالة</th>
                        <th className="pb-3 font-bold text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.slice(0, 10).map((b) => {
                        const dates = getBookingSubscriptionDates(b);
                        return (
                          <tr key={b.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 font-mono font-bold text-gym-lime">{b.orderCode}</td>
                            <td className="py-4">
                              <span className="font-bold text-white block">{b.customerName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                                {b.gender === 'female' ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold text-[10px]">
                                    أنثى 👩
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                                    ذكر 👨
                                  </span>
                                )}
                                {b.preferredShift && (
                                  <span className="truncate text-gray-400 max-w-[120px]" title={b.preferredShift}>
                                    {b.preferredShift}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 font-mono text-gray-300">{b.phone}</td>
                            <td className="py-4 text-gray-300">
                              <span className="font-bold text-white block">
                                {plans.find((p) => p.id === b.planId)?.nameAr || b.planId}
                              </span>
                              {b.trainerId && (
                                <span className="text-[10px] text-gym-lime block mt-0.5">
                                  كابتن: {trainers.find((t) => t.id === b.trainerId)?.nameAr || b.trainerId}
                                </span>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1.5 text-gray-200 font-mono text-xs font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{dates.startDate}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div>
                                <div className="flex items-center gap-1.5 text-gym-lime font-mono font-bold text-xs">
                                  <Calendar className="w-3.5 h-3.5 text-gym-lime shrink-0" />
                                  <span>{dates.endDate}</span>
                                </div>
                                {dates.daysLeft !== null && b.status === 'approved' && (
                                  <span
                                    className={`text-[10px] block mt-0.5 font-bold ${
                                      dates.daysLeft <= 4
                                        ? 'text-orange-400'
                                        : dates.daysLeft < 0
                                        ? 'text-red-400'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {dates.daysLeft > 0
                                      ? `(متبقي ${dates.daysLeft} يوم)`
                                      : dates.daysLeft === 0
                                      ? '(ينتهي اليوم)'
                                      : `(منتهي منذ ${Math.abs(dates.daysLeft)} يوم)`}
                                  </span>
                                )}
                                {b.status === 'pending' && (
                                  <span className="text-[10px] text-yellow-400/90 block mt-0.5 font-semibold">
                                    (تفعيل عند الاعتماد)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-gray-300">
                              {paymentMethods.find((pm) => pm.id === b.paymentMethodId)?.nameAr || b.paymentMethodId}
                            </td>
                            <td className="py-4">
                              {b.proofImageUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewProofBooking(b)}
                                  className="flex items-center gap-2 group p-1.5 rounded-xl bg-gym-950 border border-gym-lime/40 hover:border-gym-lime transition-all"
                                  title="اضغط لتكبير وفحص سكرين شوت التحويل"
                                >
                                  <img
                                    src={b.proofImageUrl}
                                    alt="Receipt thumbnail"
                                    className="w-12 h-12 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform shrink-0"
                                  />
                                  <div className="text-right pr-1">
                                    <span className="text-xs font-black text-gym-lime block group-hover:underline">
                                      عرض الصورة 👁️
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {b.transactionRef ? b.transactionRef.slice(0, 12) : 'إشعار الدفع'}
                                    </span>
                                  </div>
                                </button>
                              ) : (
                                <span className="text-gray-500 text-xs">
                                  {b.paymentMethodId === 'pm-cash' ? 'دفع نقدي في الجيم' : (b.transactionRef || 'لا يوجد إشعار')}
                                </span>
                              )}
                            </td>
                            <td className="py-4 font-bold text-white">
                              {b.totalAmountEGP.toLocaleString()} ج.م
                            </td>
                            <td className="py-4">
                              {b.status === 'approved' && (
                                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold">
                                  معتمد
                                </span>
                              )}
                              {b.status === 'pending' && (
                                <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-bold">
                                  معلق
                                </span>
                              )}
                              {b.status === 'rejected' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold">
                                  مرفوض
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {b.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                                      className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-black font-extrabold text-[11px] transition-colors"
                                      title="اعتماد وتفعيل الاشتراك"
                                    >
                                      اعتماد
                                    </button>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-[11px] transition-colors"
                                      title="رفض الطلب"
                                    >
                                      رفض
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleOpenEditBooking(b)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-gym-lime/20 text-gray-300 hover:text-gym-lime transition-colors border border-white/5"
                                  title="تعديل بيانات الطلب"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(b.id, b.customerName)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors border border-white/5"
                                  title="حذف الطلب نهائياً"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: محتوى الموقع */}
          {activeTab === 'content' && content && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة محتوى ونصوص الصفحة الرئيسية</h3>
                  <p className="text-xs text-gray-400">تعديل النصوص والعناوين بالعربية والإنجليزية</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                </button>
              </div>

              {/* Hero Texts */}
              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <h4 className="text-sm font-black text-gym-lime">قسم الهيدر والواجهة (Hero)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">العنوان الرئيسي (عربي)</label>
                    <input
                      type="text"
                      value={content.hero.titleAr}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, titleAr: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">العنوان الرئيسي (English)</label>
                    <input
                      type="text"
                      value={content.hero.titleEn}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, titleEn: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">الوصف الفرعي (عربي)</label>
                    <textarea
                      rows={3}
                      value={content.hero.subtitleAr}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, subtitleAr: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">الوصف الفرعي (English)</label>
                    <textarea
                      rows={3}
                      value={content.hero.subtitleEn}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, subtitleEn: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">نص الزر الأول (عربي)</label>
                    <input
                      type="text"
                      value={content.hero.ctaPrimaryAr}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, ctaPrimaryAr: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">نص الزر الثاني (عربي)</label>
                    <input
                      type="text"
                      value={content.hero.ctaSecondaryAr}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, ctaSecondaryAr: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gym-lime">شريط الإعلانات والعروض العلوي</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={content.announcement.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          announcement: { ...content.announcement, enabled: e.target.checked },
                        })
                      }
                      className="rounded accent-gym-lime w-4 h-4"
                    />
                    <span>تفعيل الشريط</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نص العرض (عربي)</label>
                  <input
                    type="text"
                    value={content.announcement.textAr}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        announcement: { ...content.announcement, textAr: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* Hero Statistics Settings */}
              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h4 className="text-sm font-black text-gym-lime flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gym-lime" />
                      <span>أرقام وإحصائيات الواجهة الرئيسية (Hero Stats)</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      التحكم في الأرقام الأربعة الظاهرة أسفل الهيدر (الأعضاء، المدربين، البرامج، نسبة الرضا)
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          stats: {
                            ...content.stats,
                            autoSyncFromDatabase: false,
                          },
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        content.stats?.autoSyncFromDatabase === false
                          ? 'bg-gym-lime text-black border-gym-lime font-black shadow-md'
                          : 'bg-gym-950 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      الأرقام الحقيقية المخصصة (موصى به)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          stats: {
                            ...content.stats,
                            autoSyncFromDatabase: true,
                          },
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        content.stats?.autoSyncFromDatabase === true
                          ? 'bg-gym-lime text-black border-gym-lime font-black shadow-md'
                          : 'bg-gym-950 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      الربط التلقائي بقاعدة البيانات
                    </button>
                  </div>
                </div>

                {/* Custom Real Stats Input Fields */}
                <div className="p-5 rounded-2xl bg-gym-950 border border-gym-lime/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gym-lime" />
                        <span>أدخل الأرقام الحقيقية التي تريد ظهورها في واجهة الموقع:</span>
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {content.stats?.autoSyncFromDatabase === false
                          ? '✅ هذه الأرقام هي التي تظهر حالياً لزوار الموقع في الهيرو فوراً بعد الضغط على "حفظ التعديلات".'
                          : '⚠️ أنت مفعل وضع "الربط التلقائي بقاعدة البيانات"، سيتم حساب الأعضاء المسجلين داخلياً.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setContent({
                          ...content,
                          stats: {
                            ...content.stats,
                            membersCount: 850,
                            trainersCount: 12,
                            programsCount: 14,
                            satisfactionRate: 98,
                            autoSyncFromDatabase: false,
                          },
                        });
                        showToast('تم ضبط أرقام راقية مقترحة للجيم (850 عضو، 12 مدرب، 14 برنامج، 98% رضا)');
                      }}
                      className="text-[11px] text-gym-lime hover:underline font-bold flex items-center gap-1 shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>اقتراح أرقام مناسبة للجيم</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-gym-900 border border-white/10">
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">الأعضاء النشطين</label>
                      <input
                        type="number"
                        min="0"
                        value={content.stats.membersCount}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            stats: { ...content.stats, membersCount: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-black text-base text-center focus:border-gym-lime"
                        placeholder="مثال: 850"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block text-center">يظهر: {content.stats.membersCount}+ عضو</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gym-900 border border-white/10">
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">المدربين المحترفين</label>
                      <input
                        type="number"
                        min="0"
                        value={content.stats.trainersCount}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            stats: { ...content.stats, trainersCount: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-gym-lime font-black text-base text-center focus:border-gym-lime"
                        placeholder="مثال: 12"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block text-center">يظهر: {content.stats.trainersCount}+ مدرب</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gym-900 border border-white/10">
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">البرامج التدريبية</label>
                      <input
                        type="number"
                        min="0"
                        value={content.stats.programsCount}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            stats: { ...content.stats, programsCount: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-black text-base text-center focus:border-gym-lime"
                        placeholder="مثال: 14"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block text-center">يظهر: {content.stats.programsCount}+ برنامج</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gym-900 border border-white/10">
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">نسبة رضا المشتركين (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={content.stats.satisfactionRate}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            stats: { ...content.stats, satisfactionRate: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-gym-lime font-black text-base text-center focus:border-gym-lime"
                        placeholder="مثال: 98"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block text-center">يظهر: {content.stats.satisfactionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: مكتبة الصور والفيديوهات */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">مكتبة الوسائط (الصور والفيديوهات)</h3>
                  <p className="text-xs text-gray-400">رفع وإدارة وحفظ الفيديوهات والصور في التخزين السحابي لاستخدامها في الموقع</p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      mediaFilter === 'all'
                        ? 'bg-gym-lime text-black shadow-md'
                        : 'bg-gym-900 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    الكل ({media.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('video')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      mediaFilter === 'video'
                        ? 'bg-gym-lime text-black shadow-md'
                        : 'bg-gym-900 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>الفيديوهات ({media.filter((m) => m.type === 'video').length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('image')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      mediaFilter === 'image'
                        ? 'bg-gym-lime text-black shadow-md'
                        : 'bg-gym-900 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>الصور ({media.filter((m) => m.type === 'image').length})</span>
                  </button>
                </div>
              </div>

              {/* Direct File Upload Dropzone */}
              <div className="p-6 rounded-3xl bg-gym-900 border-2 border-dashed border-gym-lime/30 hover:border-gym-lime transition-all text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gym-lime/10 text-gym-lime flex items-center justify-center mx-auto border border-gym-lime/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    رفع ملف مباشر من جهازك (فيديو MP4 / WebM أو صورة)
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    اختر أي فيديو أو صورة من ذاكرة جهازك ليتم حفظها سحابياً فوراً دون الحاجة لكتابة روابط
                  </p>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-gym-lime/20 transition-all">
                    {uploadingMediaFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري رفع الملف وحفظه سحابياً...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <span>اختر ملف من جهازك الآن (صورة أو فيديو)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      disabled={uploadingMediaFile}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingMediaFile(true);
                          await handleUploadFile(file);
                          setUploadingMediaFile(false);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Add Media Form by URL (Collapsible/Optional) */}
              <details className="rounded-2xl bg-gym-900 border border-white/5 overflow-hidden group">
                <summary className="p-4 text-xs font-bold text-gray-400 hover:text-white cursor-pointer select-none flex items-center justify-between">
                  <span>+ أو إضافة ملف عن طريق رابط خارجي (URL اختياري)</span>
                  <span className="text-[10px] text-gray-500">اضغط للفتح</span>
                </summary>
                <form onSubmit={handleAddMedia} className="p-5 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-300 mb-1">رابط الصورة أو الفيديو (URL)</label>
                      <input
                        type="url"
                        required
                        placeholder="https://... رابط فيديو MP4 أو صورة"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">اسم الملف / الوصف</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: فيديو تمرين الصباح"
                        value={newMediaName}
                        onChange={(e) => setNewMediaName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaType"
                          checked={newMediaType === 'image'}
                          onChange={() => setNewMediaType('image')}
                          className="accent-gym-lime"
                        />
                        <span>صورة (Image)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaType"
                          checked={newMediaType === 'video'}
                          onChange={() => setNewMediaType('video')}
                          className="accent-gym-lime"
                        />
                        <span>فيديو (Video MP4)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gym-lime text-black font-extrabold text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة إلى المكتبة</span>
                    </button>
                  </div>
                </form>
              </details>

              {/* Media Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {media
                  .filter((item) => (mediaFilter === 'all' ? true : item.type === mediaFilter))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-gym-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xl"
                    >
                      <div className="relative h-44 bg-black overflow-hidden">
                        {item.type === 'video' ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-gym-lime text-[10px] font-bold uppercase">
                          {item.type}
                        </span>

                        {/* Quick Set buttons overlay on hover */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type === 'video' && video && (
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = { ...video, heroVideoUrl: item.url };
                                setVideo(updated);
                                await fetch('/api/video', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updated),
                                });
                                showToast('تم تعيين هذا الفيديو كخلفية حية لواجهة الموقع بنجاح!');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gym-lime text-black font-extrabold text-[10px] shadow"
                            >
                              تعيين كفيديو الواجهة
                            </button>
                          )}
                          {item.type === 'image' && video && (
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = { ...video, heroPosterUrl: item.url };
                                setVideo(updated);
                                await fetch('/api/video', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updated),
                                });
                                showToast('تم تعيين هذه الصورة كبوستر للخلفية بنجاح!');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gym-lime text-black font-extrabold text-[10px] shadow"
                            >
                              تعيين كبوستر
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {item.sizeFormatted} • {item.createdAt}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              showToast('تم نسخ رابط الملف إلى الحافظة');
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الرابط</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: خلفيات الفيديو */}
          {activeTab === 'video' && video && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إعدادات فيديو الخلفية الحية</h3>
                  <p className="text-xs text-gray-400">التحكم في فيديو الواجهة، الصورة البديلة، ودرجة التعتيم مباشرة من جهازك أو من التخزين</p>
                </div>
                <button
                  onClick={handleSaveVideo}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase shadow-lg shadow-gym-lime/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                </button>
              </div>

              {/* SECTION 1: Video File Controls */}
              <div className="p-6 rounded-3xl bg-gym-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-gym-lime" />
                      <span>فيديو الواجهة الرئيسية (Hero Video)</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      يمكنك رفع فيديو جديد من جهازك مباشرة دون الحاجة لأي روابط
                    </p>
                  </div>
                  {video.heroVideoUrl && (
                    <span className="text-[11px] font-mono font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                      فيديو مفعل حالياً
                    </span>
                  )}
                </div>

                {/* Upload & Choose Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs cursor-pointer shadow-md transition-all">
                    <Upload className="w-4 h-4 stroke-[2.5]" />
                    <span>رفع فيديو من جهازك (MP4 / WebM)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadFile(file, `فيديو الواجهة - ${file.name}`);
                          if (url) {
                            setVideo({ ...video, heroVideoUrl: url });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker('video', 'اختر فيديو لخلفية واجهة الموقع', (url) => {
                        setVideo({ ...video, heroVideoUrl: url });
                        showToast('تم اختيار وتعيين الفيديو بنجاح!');
                      })
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-850 hover:bg-gym-800 text-white font-bold text-xs border border-white/10 transition-all"
                  >
                    <Video className="w-4 h-4 text-gym-lime" />
                    <span>اختيار من الفيديوهات المحفوظة في الذاكرة</span>
                  </button>
                </div>

                {/* Manual URL field (Collapsible) */}
                <details className="pt-2 text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-white select-none">
                    + أو كتابة رابط الفيديو يدوياً (اختياري)
                  </summary>
                  <div className="mt-2">
                    <input
                      type="url"
                      value={video.heroVideoUrl}
                      onChange={(e) => setVideo({ ...video, heroVideoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                </details>
              </div>

              {/* SECTION 2: Poster Image Controls */}
              <div className="p-6 rounded-3xl bg-gym-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-gym-lime" />
                      <span>صورة الغلاف والبوستر البديل (Poster Fallback)</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      تظهر هذه الصورة فوراً ريثما يبدأ تشغيل الفيديو أو على الأجهزة التي تمنع التشغيل التلقائي
                    </p>
                  </div>
                </div>

                {/* Upload & Choose Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs cursor-pointer shadow-md transition-all">
                    <Upload className="w-4 h-4 stroke-[2.5]" />
                    <span>رفع صورة بوستر من جهازك (JPG / PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadFile(file, `بوستر الواجهة - ${file.name}`);
                          if (url) {
                            setVideo({ ...video, heroPosterUrl: url });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker('image', 'اختر صورة بوستر لواجهة الموقع', (url) => {
                        setVideo({ ...video, heroPosterUrl: url });
                        showToast('تم تعيين صورة البوستر بنجاح!');
                      })
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-850 hover:bg-gym-800 text-white font-bold text-xs border border-white/10 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-gym-lime" />
                    <span>اختيار من الصور المحفوظة في الذاكرة</span>
                  </button>
                </div>

                {/* Manual URL field (Collapsible) */}
                <details className="pt-2 text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-white select-none">
                    + أو كتابة رابط صورة البوستر يدوياً (اختياري)
                  </summary>
                  <div className="mt-2">
                    <input
                      type="url"
                      value={video.heroPosterUrl}
                      onChange={(e) => setVideo({ ...video, heroPosterUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                </details>
              </div>

              {/* SECTION 3: Visual & Playback Options */}
              <div className="p-6 rounded-3xl bg-gym-900 border border-white/10 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1">
                    <span>درجة تعتيم الخلفية (Overlay Opacity)</span>
                    <span className="text-gym-lime font-mono">{Math.round(video.overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={video.overlayOpacity}
                    onChange={(e) => setVideo({ ...video, overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-gym-lime cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500">
                    تساعد زيادة التعتيم على إبراز النصوص البيضاء والأزرار بشكل أوضح وأفخم.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={video.autoplay}
                      onChange={(e) => setVideo({ ...video, autoplay: e.target.checked })}
                      className="rounded accent-gym-lime w-4 h-4"
                    />
                    <span>تشغيل تلقائي للفيديو (Autoplay)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={video.muted}
                      onChange={(e) => setVideo({ ...video, muted: e.target.checked })}
                      className="rounded accent-gym-lime w-4 h-4"
                    />
                    <span>كتم الصوت تلقائياً (Muted)</span>
                  </label>
                </div>
              </div>

              {/* Live Preview of video */}
              <div className="p-6 rounded-3xl bg-gym-900 border border-white/10">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-gym-lime" />
                  <span>معاينة حية فورية لخلفية الفيديو النشطة</span>
                </h4>
                <div className="relative h-72 rounded-2xl overflow-hidden border border-white/10">
                  <video
                    key={video.heroVideoUrl}
                    src={video.heroVideoUrl}
                    poster={video.heroPosterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                    style={{ opacity: video.overlayOpacity }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                    <span className="text-xs font-bold text-gym-lime uppercase tracking-widest px-3 py-1 bg-black/60 rounded-full border border-gym-lime/30 mb-2">
                      معاينة الواجهة
                    </span>
                    <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
                      BUILD YOUR STRONGER SELF
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: الاشتراكات والأسعار */}
          {activeTab === 'plans' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة باقات الاشتراك والأسعار (بالجنيه المصري)</h3>
                  <p className="text-xs text-gray-400">تعديل الأسعار والخصومات فورياً دون إعادة بناء الموقع</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-6 rounded-3xl bg-gym-900 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-white">{plan.nameAr}</h4>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={(e) => handleUpdatePlan(plan.id, { isActive: e.target.checked })}
                          className="accent-gym-lime w-4 h-4"
                        />
                        <span>مفعلة</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          السعر الفعلي (ج.م)
                        </label>
                        <input
                          type="number"
                          value={plan.priceEGP}
                          onChange={(e) => handleUpdatePlan(plan.id, { priceEGP: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          السعر قبل الخصم (ج.م)
                        </label>
                        <input
                          type="number"
                          value={plan.originalPriceEGP}
                          onChange={(e) =>
                            handleUpdatePlan(plan.id, { originalPriceEGP: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={plan.isPopular}
                          onChange={(e) => handleUpdatePlan(plan.id, { isPopular: e.target.checked })}
                          className="accent-gym-lime w-4 h-4"
                        />
                        <span>تمييز كـ "الأكثر طلباً"</span>
                      </label>
                    </div>

                    <div className="pt-2 text-xs text-gray-400">
                      <span className="font-bold text-gray-300">المدة:</span> {plan.durationMonths} شهر
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: طرق الدفع المصرية */}
          {activeTab === 'payments' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة طرق الدفع المصرية</h3>
                  <p className="text-xs text-gray-400">فودافون كاش، إنستاباي، أورنج، اتصالات، وي باي، وفوري</p>
                </div>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gym-lime" />
                        <h4 className="text-base font-black text-white">{pm.nameAr} ({pm.nameEn})</h4>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={pm.isActive}
                          onChange={(e) => handleTogglePayment(pm.id, e.target.checked)}
                          className="accent-gym-lime w-4 h-4"
                        />
                        <span className={pm.isActive ? 'text-green-400' : 'text-gray-500'}>
                          {pm.isActive ? 'مفعل بالموقع' : 'معطل'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pm.walletNumber !== undefined && (
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1">
                            رقم المحفظة المخصصة للجيم
                          </label>
                          <input
                            type="text"
                            value={pm.walletNumber}
                            onChange={(e) =>
                              handleUpdatePaymentDetails(pm.id, { walletNumber: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono text-xs"
                          />
                        </div>
                      )}

                      {pm.instapayHandle !== undefined && (
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1">
                            عنوان إنستاباي (InstaPay Handle / IPA)
                          </label>
                          <input
                            type="text"
                            value={pm.instapayHandle}
                            onChange={(e) =>
                              handleUpdatePaymentDetails(pm.id, { instapayHandle: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        تعليمات الدفع والتحويل للمشتركين (عربي)
                      </label>
                      <textarea
                        rows={2}
                        value={pm.instructionsAr}
                        onChange={(e) =>
                          handleUpdatePaymentDetails(pm.id, { instructionsAr: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: إدارة الأعضاء */}
          {activeTab === 'members' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة الأعضاء والاشتراكات</h3>
                  <p className="text-xs text-gray-400">البحث، الإضافة، متابعة صلاحية الاشتراكات</p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عضو جديد</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو رقم الهاتف أو كود العضوية..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={memberFilterStatus}
                  onChange={(e) => setMemberFilterStatus(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="expiring_soon">ينتهي قريباً</option>
                  <option value="expired">منتهي</option>
                </select>
              </div>

              {/* Members Table */}
              <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-bold">كود العضوية</th>
                      <th className="pb-3 font-bold">الاسم</th>
                      <th className="pb-3 font-bold">رقم الهاتف</th>
                      <th className="pb-3 font-bold">تاريخ البداية</th>
                      <th className="pb-3 font-bold">تاريخ الانتهاء</th>
                      <th className="pb-3 font-bold">الحالة</th>
                      <th className="pb-3 font-bold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members
                      .filter((m) => {
                        const matchQ =
                          !memberSearch ||
                          m.fullName.includes(memberSearch) ||
                          m.phone.includes(memberSearch) ||
                          m.membershipCode.includes(memberSearch);
                        const matchS =
                          memberFilterStatus === 'all' || m.status === memberFilterStatus;
                        return matchQ && matchS;
                      })
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono font-bold text-gym-lime">{m.membershipCode}</td>
                          <td className="py-4 font-bold text-white">{m.fullName}</td>
                          <td className="py-4 font-mono text-gray-300">{m.phone}</td>
                          <td className="py-4 text-gray-400 font-mono">{m.startDate}</td>
                          <td className="py-4 text-gray-400 font-mono">{m.endDate}</td>
                          <td className="py-4">
                            {m.status === 'active' && (
                              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-bold">
                                نشط
                              </span>
                            )}
                            {m.status === 'expiring_soon' && (
                              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold">
                                ينتهي قريباً
                              </span>
                            )}
                            {m.status === 'expired' && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">
                                منتهي
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSendReminderToMember(m)}
                                title="إرسال رسالة تذكير عبر واتساب"
                                className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m.id)}
                                title="حذف العضو"
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Add Member Modal */}
              {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                  <div className="relative w-full max-w-md bg-gym-900 border border-white/10 rounded-3xl p-6 sm:p-8">
                    <button
                      onClick={() => setShowAddMemberModal(false)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-black text-white mb-4">إضافة عضو جديد</h3>

                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالكامل *</label>
                        <input
                          type="text"
                          required
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف *</label>
                        <input
                          type="tel"
                          required
                          value={newMemberPhone}
                          onChange={(e) => setNewMemberPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الباقة</label>
                        <select
                          value={newMemberPlanId}
                          onChange={(e) => setNewMemberPlanId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nameAr} ({p.priceEGP} ج.م)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMemberModal(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gym-lime text-black font-extrabold text-xs"
                        >
                          إضافة وتفعيل
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: تذكير الواتساب الذاتي (4 أيام) */}
          {activeTab === 'reminders' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      نظام التذكير التلقائي عبر الواتساب (WhatsApp Auto-Reminders)
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/20 text-gym-lime border border-gym-lime/30">
                      مهلة {reminderConfig.daysThreshold || 4} أيام
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    فحص ذكي للمشتركين الذين تنتهي عضويتهم قريباً وإرسال رسائل تذكير وتجديد مخصصة عبر واتساب بنقرة واحدة أو مجدولة تلقائياً
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleScanReminders}
                    disabled={reminderScanLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white font-bold text-xs hover:border-gym-lime/50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-gym-lime ${reminderScanLoading ? 'animate-spin' : ''}`} />
                    <span>{reminderScanLoading ? 'جاري الفحص...' : 'فحص التنبيهات الآن'}</span>
                  </button>
                  <button
                    onClick={handleSaveReminderConfig}
                    disabled={savingReminderConfig}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs hover:bg-gym-lime-light transition-all shadow-lg shadow-gym-lime/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingReminderConfig ? 'جاري الحفظ...' : 'حفظ إعدادات القالب'}</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gym-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">إجمالي المشتركين النشطين</span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {members.filter((m) => m.status === 'active' || m.status === 'expiring_soon').length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-gym-900 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                  <div>
                    <span className="text-xs text-amber-400 block font-bold">
                      ينتهي اشتراكهم خلال {reminderConfig.daysThreshold || 4} أيام أو أقل
                    </span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {expiringMembers.length} مشتركون
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <BellRing className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-gym-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">تم إرسال تذكير لهم</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      {members.filter((m) => !!m.lastReminderSentAt).length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Expiring Members List Section */}
              <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-gym-lime" />
                    <h4 className="text-base font-black text-white">
                      قائمة المشتركين الواجب تذكيرهم (متبقي {reminderConfig.daysThreshold || 4} أيام أو أقل)
                    </h4>
                  </div>
                  <span className="text-xs text-gray-400">
                    يتم تحديث القائمة تلقائياً بناءً على تاريخ انتهاء اشتراك كل عضو
                  </span>
                </div>

                {expiringMembers.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h5 className="text-sm font-bold text-white mb-1">
                      لا يوجد أي اشتراك ينتهي خلال الـ {reminderConfig.daysThreshold || 4} أيام القادمة
                    </h5>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      جميع الأعضاء الحاليين اشتراكاتهم سارية ومستقرة، أو تم تجديدها بنجاح. سيظهر المشتركون هنا تلقائياً بمجرد اقتراب موعد انتهائهم.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                          <th className="pb-3 font-bold">كود العضوية</th>
                          <th className="pb-3 font-bold">اسم المشترك</th>
                          <th className="pb-3 font-bold">رقم الهاتف</th>
                          <th className="pb-3 font-bold">الباقة</th>
                          <th className="pb-3 font-bold">تاريخ الانتهاء</th>
                          <th className="pb-3 font-bold">الوقت المتبقي</th>
                          <th className="pb-3 font-bold">حالة التذكير</th>
                          <th className="pb-3 font-bold text-center">الإجراء (واتساب)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {expiringMembers.map((m) => {
                          const daysRem = m.daysRemaining ?? calculateDaysRemaining(m.endDate);
                          const planName = plans.find((p) => p.id === m.planId)?.nameAr || 'الباقة';
                          return (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 font-mono font-bold text-gym-lime">{m.membershipCode}</td>
                              <td className="py-4 font-bold text-white">{m.fullName}</td>
                              <td className="py-4 font-mono text-gray-300" dir="ltr">{m.phone}</td>
                              <td className="py-4 text-gray-300">{planName}</td>
                              <td className="py-4 text-gray-400 font-mono">{m.endDate}</td>
                              <td className="py-4">
                                {daysRem <= 0 ? (
                                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                                    ينتهي اليوم!
                                  </span>
                                ) : daysRem === 1 ? (
                                  <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                                    ينتهي غداً (يوم واحد)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                                    متبقي {daysRem} أيام
                                  </span>
                                )}
                              </td>
                              <td className="py-4">
                                {m.lastReminderSentAt ? (
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>تم الإرسال ({new Date(m.lastReminderSentAt).toLocaleDateString('ar-EG')})</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500 font-medium">لم يتم الإرسال بعد</span>
                                )}
                              </td>
                              <td className="py-4 text-center">
                                <button
                                  onClick={() => handleSendReminderToMember(m)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors shadow-md shadow-emerald-500/20"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>إرسال واتساب</span>
                                  <ExternalLink className="w-3 h-3 opacity-75" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Settings & Template Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Template Form */}
                <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 space-y-5">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-base font-black text-white">إعدادات وقالب رسالة التذكير</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      خصص نص الرسالة التي ستصل للعميل مع المتغيرات الذكية
                    </p>
                  </div>

                  {/* Toggle & Days threshold */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gym-950 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">حالة التذكير التلقائي</span>
                        <span className="text-[11px] text-gray-400">تفعيل فحص ومطابقة التنبيهات</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reminderConfig.enabled}
                          onChange={(e) =>
                            setReminderConfig({ ...reminderConfig, enabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gym-lime"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl bg-gym-950 border border-white/10">
                      <label className="text-xs font-bold text-white block mb-1">
                        إرسال التذكير قبل الانتهاء بـ:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={reminderConfig.daysThreshold || 4}
                          onChange={(e) =>
                            setReminderConfig({
                              ...reminderConfig,
                              daysThreshold: Math.max(1, parseInt(e.target.value) || 4),
                            })
                          }
                          className="w-20 px-3 py-1.5 rounded-xl bg-gym-900 border border-white/10 text-white font-black text-center text-sm"
                        />
                        <span className="text-xs text-gray-400 font-bold">أيام (الافتراضي: 4 أيام)</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Tags Helper Chips */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">
                      انقر لإضافة المتغيرات الذكية داخل نص الرسالة:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { tag: '{الاسم}', desc: 'اسم المشترك' },
                        { tag: '{الباقة}', desc: 'اسم الباقة' },
                        { tag: '{الأيام_المتبقية}', desc: 'الأيام المتبقية' },
                        { tag: '{تاريخ_الانتهاء}', desc: 'تاريخ الانتهاء' },
                        { tag: '{كود_العضوية}', desc: 'كود العضوية' },
                        { tag: '{رابط_الموقع}', desc: 'رابط الموقع والتجديد' },
                      ].map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => {
                            setReminderConfig({
                              ...reminderConfig,
                              messageTemplate: (reminderConfig.messageTemplate || '') + ' ' + item.tag,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gym-950 border border-white/10 hover:border-gym-lime text-[11px] text-gym-lime font-mono transition-colors"
                          title={item.desc}
                        >
                          + {item.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      قالب الرسالة المعتمد (WhatsApp Message Template):
                    </label>
                    <textarea
                      rows={7}
                      value={reminderConfig.messageTemplate}
                      onChange={(e) =>
                        setReminderConfig({ ...reminderConfig, messageTemplate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gym-950 border border-white/10 text-white text-xs leading-relaxed font-sans focus:outline-none focus:border-gym-lime"
                      placeholder="اكتب صيغة الرسالة الترحيبية والتذكيرية هنا..."
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSaveReminderConfig}
                      disabled={savingReminderConfig}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs hover:bg-gym-lime-light transition-all shadow-md shadow-gym-lime/20 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingReminderConfig ? 'جاري الحفظ...' : 'حفظ إعدادات القالب'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Realistic WhatsApp Chat Preview & Test Dispatch */}
                <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-white">معاينة الرسالة المباشرة (WhatsApp Preview)</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          هكذا تظهر الرسالة في هاتف المشترك على تطبيق واتساب
                        </p>
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    </div>

                    {/* Realistic WhatsApp Chat Box */}
                    <div className="rounded-2xl overflow-hidden border border-[#202c33] bg-[#0b141a] shadow-inner">
                      {/* WhatsApp Header Bar */}
                      <div className="bg-[#202c33] px-4 py-2.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gym-lime text-black font-black text-xs flex items-center justify-center">
                          GL
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">GYM & LENO (الإدارة)</span>
                          <span className="text-[10px] text-emerald-400 font-mono">متصل الآن</span>
                        </div>
                      </div>

                      {/* Chat Messages Body */}
                      <div className="p-4 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] min-h-[220px] flex flex-col justify-end">
                        <div className="max-w-[85%] self-end bg-[#005c4b] text-white text-xs p-3.5 rounded-2xl rounded-tr-none shadow leading-relaxed whitespace-pre-wrap break-words font-sans">
                          {buildWhatsAppReminderMessage(reminderConfig.messageTemplate, {
                            fullName: 'أحمد محمود',
                            planName: 'باقة 3 شهور VIP',
                            daysRemaining: reminderConfig.daysThreshold || 4,
                            endDate: '2026-10-30',
                            membershipCode: 'LENO-DEMO-01',
                          })}
                          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-emerald-200">
                            <span>10:00 ص</span>
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Test dispatch to admin's phone */}
                  <div className="p-4 rounded-2xl bg-gym-950 border border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      تجربة إرسال الرسالة إلى رقمك مباشرة للتأكد:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="مثال: 01012345678"
                        value={testReminderPhone}
                        onChange={(e) => setTestReminderPhone(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gym-900 border border-white/10 text-white text-xs font-mono"
                        dir="ltr"
                      />
                      <button
                        onClick={handleTestWhatsAppMessage}
                        type="button"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>تجربة في واتساب</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works Information Box */}
              <div className="p-5 rounded-2xl bg-gym-900/60 border border-gym-lime/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/20 flex items-center justify-center text-gym-lime shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h5 className="font-extrabold text-white text-sm">كيف يعمل نظام الرسائل الذاتي في GYM & LENO؟</h5>
                  <p className="text-gray-400 leading-relaxed">
                    1. يقوم النظام يومياً (الساعة 10:00 صباحاً بتوقيت القاهرة) بفحص كافة اشتراكات المشتركين السارية عبر مهمة مجدولة (Cron Job).
                    <br />
                    2. في حال تبقى 4 أيام أو أقل على انتهاء اشتراك العضو، يتم إدراجه في قائمة التنبيهات وتجهيز رسالة واتساب مخصصة باسمه وبيانات باقته.
                    <br />
                    3. يمكنك الضغط على زر &quot;إرسال واتساب&quot; ليفتح تطبيق أو موقع WhatsApp فوراً مع الرقم المعتمد والرسالة جاهزة للإرسال، كما يتم حفظ توقيت آخر إشعار في قاعدة البيانات.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: رمز QR للموقع (دائم مدى الحياة) */}
          {activeTab === 'qrcode' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      رمز QR الدائم للموقع العام (Permanent Lifetime QR Code)
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gym-lime/20 text-gym-lime border border-gym-lime/30 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>ثابت 100% ولا يقفل أبداً</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    كود QR مشفر هندسياً بشكل مباشر على رابط الموقع الرسمي (https://gym-leno.vercel.app)، يمكنك طباعته فوراً على ستاندات الاستقبال، البانرات، وكروت الأعضاء.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/gym-leno-qr-print.png"
                    download="gym-leno-qr-print-2400.png"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase hover:bg-gym-lime-light transition-all shadow-lg shadow-gym-lime/20"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>تحميل نسخة الطباعة (PNG)</span>
                  </a>
                  <a
                    href="/gym-leno-qr.svg"
                    download="gym-leno-qr-vector.svg"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white font-bold text-xs hover:border-gym-lime transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>فيكتور لليافطات (SVG)</span>
                  </a>
                </div>
              </div>

              {/* Technical Guarantee Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start sm:items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/40">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-xs space-y-1">
                  <h5 className="font-extrabold text-emerald-300 text-sm">
                    ضمان الاستمرارية والأمان: كود دائم مدى الحياة بدون وسيط
                  </h5>
                  <p className="text-gray-300 leading-relaxed">
                    هذا الكود هو <strong>Static QR Code (كود مباشر وثابت)</strong>، مصفوفة النقاط مشفرة على الرابط الحقيقي مباشرة ولا تمر عبر أي شركة أو خدمة اختصار روابط أو تجارب مجانية مؤقتة. هذا يضمن أن الكود سيعمل دائماً وفي أي وقت ولن يتعطل أو يطلب اشتراكاً مستقبلياً إطلاقاً.
                  </p>
                </div>
              </div>

              {/* Main Content Grid: Preview Card + Formats & Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Preview Box */}
                <div className="lg:col-span-5 bg-gym-900 rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-white rounded-3xl shadow-2xl border-4 border-gym-lime/50 relative group">
                    <img
                      src="/gym-leno-qr-print.png"
                      alt="Gym & Leno Live QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/80 border border-white/20">
                        جاهز للمسح بالكاميرا الآن
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white font-display uppercase tracking-wide">
                      GYM & LENO OFFICIAL QR
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      https://gym-leno.vercel.app
                    </p>
                  </div>

                  <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://gym-leno.vercel.app');
                        showToast('تم نسخ رابط الموقع إلى الحافظة');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gym-950 hover:bg-black text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>نسخ رابط الموقع المباشر</span>
                    </button>

                    <button
                      onClick={() => {
                        window.open('https://gym-leno.vercel.app', '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gym-900 hover:bg-gym-850 text-gym-lime border border-gym-lime/30 text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>فتح الموقع في نافذة جديدة</span>
                    </button>
                  </div>
                </div>

                {/* Right Download & Printing Options */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* File Formats Card */}
                  <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 space-y-4">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Download className="w-5 h-5 text-gym-lime" />
                      <span>صيغ التحميل المتاحة للاستخدام المكتبي والمطابع</span>
                    </h4>

                    <div className="space-y-3">
                      
                      {/* Option 1: Print PNG */}
                      <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/20 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white">1. نسخة الطباعة العادية (PNG)</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-gym-lime/10 text-gym-lime font-bold">2400 × 2400 بكسل</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            أعلى درجات التباين والوضوح (أسود على أبيض نقي). ممتازة لكروت العضوية والورق المقوى واستكرات الأجهزة.
                          </p>
                        </div>
                        <a
                          href="/gym-leno-qr-print.png"
                          download="gym-leno-qr-print.png"
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-lime text-black font-extrabold text-xs shadow-md"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>تحميل PNG</span>
                        </a>
                      </div>

                      {/* Option 2: Vector SVG */}
                      <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/20 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white">2. نسخة الفيكتور للبانرات (SVG)</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 font-bold">دقة غير محدودة ∞</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ملف رسومي هندسي موجه لمصممي الجرافيك ومطابع اليافطات الكبرى. مهما كبّرت الحجم على واجهة الجيم لن يفقد جودته أبداً.
                          </p>
                        </div>
                        <a
                          href="/gym-leno-qr.svg"
                          download="gym-leno-qr-vector.svg"
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-900 border border-white/20 text-white font-extrabold text-xs hover:border-purple-400"
                        >
                          <FileDown className="w-3.5 h-3.5 text-purple-400" />
                          <span>تحميل SVG</span>
                        </a>
                      </div>

                      {/* Option 3: Branded Dark */}
                      <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/20 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white">3. النسخة الداكنة لمواقع التواصل (Social Media)</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-bold">1600 × 1600 بكسل</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            تصميم داكن فاخر بهوية جيم آند لينو لمشاركته عبر إنستجرام، فيسبوك، وحالات الواتساب.
                          </p>
                        </div>
                        <a
                          href="/gym-leno-qr-brand.png"
                          download="gym-leno-qr-brand.png"
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-900 border border-white/20 text-white font-extrabold text-xs hover:border-blue-400"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>تحميل النسخة</span>
                        </a>
                      </div>

                    </div>
                  </div>

                  {/* Recommended Reception Stand Guide */}
                  <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 space-y-3">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Printer className="w-5 h-5 text-gym-lime" />
                      <span>نصائح للاستخدام الأمثل في صالة الجيم:</span>
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-gym-lime font-black">•</span>
                        <span><strong>ستاند الاستقبال (Reception Acrylic Stand):</strong> اطبع كود الـ PNG بمقاس 10×15 سم وضعه داخل حامل أكريليك شفاف على الكاونتر ليتمكن الزوار من تصفح الباقات فوراً.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gym-lime font-black">•</span>
                        <span><strong>كروت العضوية (Membership Cards):</strong> ضع الكود في ظهر الكارت ليتمكن المشترك من الاستعلام عن اشتراكه وتاريخ انتهائه في أي وقت.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gym-lime font-black">•</span>
                        <span><strong>ملصقات المرايا والأجهزة:</strong> يمكنك وضع كود صغير بالقرب من صالات الأجهزة أو غرفة الاستراحة لتسهيل متابعة البرامج وجداول التدريب.</span>
                      </li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 8: المدفوعات والطلبات */}
          {activeTab === 'bookings' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة طلبات الحجز والمدفوعات</h3>
                  <p className="text-xs text-gray-400">مراجعة أرقام المعاملات واعتماد تفعيل العضويات</p>
                </div>
              </div>

              <div className="bg-gym-900 rounded-3xl border border-white/10 p-6 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-bold">كود الطلب</th>
                      <th className="pb-3 font-bold">الاسم</th>
                      <th className="pb-3 font-bold">الهاتف</th>
                      <th className="pb-3 font-bold">الباقة</th>
                      <th className="pb-3 font-bold">تاريخ الاشتراك</th>
                      <th className="pb-3 font-bold">تاريخ الانتهاء</th>
                      <th className="pb-3 font-bold">وسيلة الدفع</th>
                      <th className="pb-3 font-bold">إشعار وسكرين شوت التحويل</th>
                      <th className="pb-3 font-bold">المبلغ</th>
                      <th className="pb-3 font-bold">الحالة</th>
                      <th className="pb-3 font-bold text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => {
                      const dates = getBookingSubscriptionDates(b);
                      return (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono font-bold text-gym-lime">{b.orderCode}</td>
                        <td className="py-4">
                          <span className="font-bold text-white block">{b.customerName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                            {b.gender === 'female' ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold text-[10px]">
                                أنثى 👩
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                                ذكر 👨
                              </span>
                            )}
                            <span className="truncate text-gray-400 max-w-[140px]" title={b.preferredShift}>
                              {b.preferredShift}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-gray-300">{b.phone}</td>
                        <td className="py-4 text-gray-300">
                          <div>
                            <span className="font-bold text-white block">
                              {plans.find((p) => p.id === b.planId)?.nameAr || b.planId}
                            </span>
                            {b.trainerId && (
                              <span className="text-[11px] text-gym-lime block mt-0.5">
                                كابتن: {trainers.find((t) => t.id === b.trainerId)?.nameAr || b.trainerId}
                                {b.trainerFeeEGP && b.trainerFeeEGP > 0 ? ` (+${b.trainerFeeEGP} ج.م)` : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-gray-200 font-mono text-xs font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{dates.startDate}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <div className="flex items-center gap-1.5 text-gym-lime font-mono font-bold text-xs">
                              <Calendar className="w-3.5 h-3.5 text-gym-lime shrink-0" />
                              <span>{dates.endDate}</span>
                            </div>
                            {dates.daysLeft !== null && b.status === 'approved' && (
                              <span
                                className={`text-[10px] block mt-0.5 font-bold ${
                                  dates.daysLeft <= 4
                                    ? 'text-orange-400'
                                    : dates.daysLeft < 0
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {dates.daysLeft > 0
                                  ? `(متبقي ${dates.daysLeft} يوم)`
                                  : dates.daysLeft === 0
                                  ? '(ينتهي اليوم)'
                                  : `(منتهي منذ ${Math.abs(dates.daysLeft)} يوم)`}
                              </span>
                            )}
                            {b.status === 'pending' && (
                              <span className="text-[10px] text-yellow-400/90 block mt-0.5 font-semibold">
                                (تفعيل عند الاعتماد)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">
                          {paymentMethods.find((pm) => pm.id === b.paymentMethodId)?.nameAr || b.paymentMethodId}
                        </td>
                        <td className="py-4">
                          {b.proofImageUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewProofBooking(b)}
                              className="flex items-center gap-2 group p-1.5 rounded-xl bg-gym-950 border border-gym-lime/40 hover:border-gym-lime transition-all"
                              title="اضغط لتكبير وفحص سكرين شوت التحويل"
                            >
                              <img
                                src={b.proofImageUrl}
                                alt="Receipt thumbnail"
                                className="w-12 h-12 rounded-lg object-cover border border-white/10 group-hover:scale-105 transition-transform shrink-0"
                              />
                              <div className="text-right pr-1">
                                <span className="text-xs font-black text-gym-lime block group-hover:underline">
                                  عرض الصورة 👁️
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {b.transactionRef ? b.transactionRef.slice(0, 12) : 'إشعار الدفع'}
                                </span>
                              </div>
                            </button>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              {b.paymentMethodId === 'pm-cash' ? 'دفع نقدي في الجيم' : (b.transactionRef || 'لا يوجد إشعار')}
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-black text-white font-mono block">
                            {b.totalAmountEGP.toLocaleString()} ج.م
                          </span>
                          {b.trainerFeeEGP && b.trainerFeeEGP > 0 ? (
                            <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                              ({b.planPriceEGP || (b.totalAmountEGP - b.trainerFeeEGP)} باقة + {b.trainerFeeEGP} مدرب)
                            </span>
                          ) : null}
                        </td>
                        <td className="py-4">
                          {b.status === 'approved' && (
                            <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold">
                              معتمد ومفعل
                            </span>
                          )}
                          {b.status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-bold">
                              قيد المراجعة
                            </span>
                          )}
                          {b.status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold">
                              مرفوض
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                                  className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-black font-extrabold text-[11px] transition-colors"
                                  title="اعتماد وتفعيل الاشتراك"
                                >
                                  اعتماد
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-[11px] transition-colors"
                                  title="رفض الطلب"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleOpenEditBooking(b)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-gym-lime/20 text-gray-300 hover:text-gym-lime transition-colors border border-white/5"
                              title="تعديل بيانات الطلب"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id, b.customerName)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors border border-white/5"
                              title="حذف الطلب نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: البرامج والمدربون */}
          {activeTab === 'programs' && (
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="pb-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة فريق المدربين والبرامج الرياضية</h3>
                  <p className="text-xs text-gray-400">تحكم كامل في إضافة، تعديل، وحذف المدربين والبرامج التدريبية المعروضة للجمهور</p>
                </div>
              </div>

              {/* SECTION 1: Trainers CRUD */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-gym-lime" />
                      <span>فريق المدربين المعتمدين ({trainers.length})</span>
                    </h4>
                    <p className="text-xs text-gray-400">المدربون المتاحون للحجز واختيار المتدربين في الموقع</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrainer(null);
                      setShowTrainerModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs shadow-lg shadow-gym-lime/20 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>إضافة مدرب جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainers.map((t) => (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl bg-gym-900 border border-white/10 hover:border-gym-lime/30 transition-all flex flex-col justify-between gap-4 shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={t.image}
                          alt={t.nameAr}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-base font-black text-white truncate">{t.nameAr}</h5>
                          <span className="text-xs text-gray-400 block mb-1 font-mono">{t.nameEn}</span>
                          <span className="text-xs font-bold text-gym-lime block mb-1.5">{t.specialtyAr}</span>
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-300">
                            <span className="px-2 py-0.5 rounded-lg bg-gym-lime/10 text-gym-lime border border-gym-lime/30 font-extrabold font-mono">
                              {(t.priceEGP || 0) > 0
                                ? `رسوم التدريب: ${(t.priceEGP || 0).toLocaleString()} ج.م`
                                : 'تدريب مجاني'}
                            </span>
                            <span className="bg-black/40 px-2 py-0.5 rounded border border-white/5 font-mono">
                              ⭐ {t.rating}
                            </span>
                            <span>{t.experienceYears} سنوات خبرة</span>
                          </div>
                        </div>
                      </div>

                      {t.bioAr && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                          {t.bioAr}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrainer(t);
                            setShowTrainerModal(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-850 hover:bg-gym-800 text-gym-lime font-bold text-xs border border-gym-lime/20 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل البيانات</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTrainer(t.id, t.nameAr)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-colors"
                          title="حذف المدرب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Programs CRUD */}
              <div className="space-y-5 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-gym-lime" />
                      <span>البرامج والمسارات التدريبية ({programs.length})</span>
                    </h4>
                    <p className="text-xs text-gray-400">باقات الكورسات الرياضية وبرامج التنشيف والتضخيم المعروضة</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProgram(null);
                      setShowProgramModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs shadow-lg shadow-gym-lime/20 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>إضافة برنامج جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((p) => {
                    const assignedCoach = trainers.find((t) => t.id === p.coachId);
                    return (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl bg-gym-900 border border-white/10 hover:border-gym-lime/30 transition-all flex flex-col justify-between gap-4 shadow-xl"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={p.image}
                            alt={p.titleAr}
                            className="w-24 h-20 rounded-2xl object-cover shrink-0 border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-gym-lime uppercase px-2 py-0.5 rounded bg-gym-lime/10 border border-gym-lime/20 inline-block mb-1">
                              {p.category}
                            </span>
                            <h5 className="text-base font-black text-white truncate">{p.titleAr}</h5>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              <span className="font-bold text-white">{p.durationWeeks} أسابيع</span>
                              <span>•</span>
                              <span>{p.difficultyAr}</span>
                              <span>•</span>
                              <span>{p.sessionsPerWeek} حصص/أسبوع</span>
                            </div>
                            {assignedCoach && (
                              <span className="text-[11px] text-gray-400 mt-1 block">
                                الكابتن المشرف: <strong className="text-white">{assignedCoach.nameAr}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {p.descriptionAr && (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                            {p.descriptionAr}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProgram(p);
                              setShowProgramModal(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-850 hover:bg-gym-800 text-gym-lime font-bold text-xs border border-gym-lime/20 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل البرنامج</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProgram(p.id, p.titleAr)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-colors"
                            title="حذف البرنامج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: آراء المشتركين والتحولات (Testimonials) */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <MessageSquareQuote className="w-6 h-6 text-gym-lime" />
                    <span>إدارة آراء المشتركين وقصص التحول ({testimonials.length})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    أضف وعدل واحذف تجارب وقصص نجاح المشتركين المعروضة في قسم آراء المشتركين بالصفحة الرئيسية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTestimonial(null);
                    setShowTestimonialModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs shadow-lg shadow-gym-lime/20 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة رأي / قصة تحول جديدة</span>
                </button>
              </div>

              {testimonials.length === 0 ? (
                <div className="text-center py-16 bg-gym-900/50 rounded-3xl border border-dashed border-white/10">
                  <MessageSquareQuote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-bold">لا توجد آراء مسجلة حتى الآن</p>
                  <p className="text-gray-600 text-xs mt-1">اضغط على زر الإضافة أعلاه لإدراج أول قصة تحول لمشترك</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 rounded-3xl bg-gym-900 border border-white/10 hover:border-gym-lime/40 transition-all flex flex-col justify-between shadow-xl group"
                    >
                      <div>
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 mb-3 text-yellow-400">
                          {[...Array(Math.min(Math.max(item.rating || 5, 1), 5))].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        {/* Comment text */}
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 italic line-clamp-4">
                          "{item.commentAr || item.commentEn}"
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4">
                        {/* Member info */}
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.nameAr}
                              className="w-12 h-12 rounded-full object-cover border border-gym-lime/40 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gym-800 border border-gym-lime/40 flex items-center justify-center text-gym-lime shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-white font-display uppercase truncate">
                              {item.nameAr}
                            </h4>
                            {item.nameEn && item.nameEn !== item.nameAr && (
                              <p className="text-[11px] text-gray-400 truncate">{item.nameEn}</p>
                            )}
                            <span className="text-xs text-gym-lime font-bold block mt-0.5 truncate">
                              {item.roleAr}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTestimonial(item);
                              setShowTestimonialModal(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gym-850 hover:bg-gym-800 text-gym-lime font-bold text-xs border border-gym-lime/20 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(item.id, item.nameAr)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: الأسئلة الشائعة والأجوبة (FAQs) */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-gym-lime" />
                    <span>إدارة الأسئلة الشائعة والأجوبة ({faqs.length})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    أنت المتحكم الكامل في نصوص الأسئلة والإجابات لمنع أي معلومات خاطئة ولتحديث مواعيد وسياسات الجيم
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingFaq(null);
                    setShowFaqModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs uppercase shadow-lg shadow-gym-lime/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سؤال وإجابة جديدة</span>
                </button>
              </div>

              {/* Search & Quick Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="ابحث في الأسئلة أو الإجابات..."
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-gym-lime"
                  />
                  {faqSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFaqSearchQuery('')}
                      className="absolute left-3 top-2.5 text-gray-400 hover:text-white text-xs"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 p-2 rounded-xl bg-gym-900 border border-white/10 text-center">
                    <span className="text-gray-400 block text-[10px]">الظاهرة في الموقع</span>
                    <span className="font-black text-gym-lime text-sm">
                      {faqs.filter((f) => f.isActive !== false).length}
                    </span>
                  </div>
                  <div className="flex-1 p-2 rounded-xl bg-gym-900 border border-white/10 text-center">
                    <span className="text-gray-400 block text-[10px]">المخفية</span>
                    <span className="font-black text-gray-400 text-sm">
                      {faqs.filter((f) => f.isActive === false).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* FAQ Items List */}
              {faqs.length === 0 ? (
                <div className="text-center py-16 bg-gym-900/50 rounded-3xl border border-dashed border-white/10 space-y-3">
                  <HelpCircle className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-gray-400 text-sm font-bold">لا توجد أسئلة شائعة مسجلة حالياً</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq(null);
                      setShowFaqModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gym-lime text-black font-extrabold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة أول سؤال الآن</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs
                    .filter((f) => {
                      if (!faqSearchQuery.trim()) return true;
                      const q = faqSearchQuery.toLowerCase();
                      return (
                        f.questionAr?.toLowerCase().includes(q) ||
                        f.questionEn?.toLowerCase().includes(q) ||
                        f.answerAr?.toLowerCase().includes(q) ||
                        f.answerEn?.toLowerCase().includes(q)
                      );
                    })
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((item, index) => {
                      const isItemActive = item.isActive !== false;
                      return (
                        <div
                          key={item.id || index}
                          className={`p-6 rounded-3xl bg-gym-900 border transition-all ${
                            isItemActive
                              ? 'border-white/10 hover:border-gym-lime/40'
                              : 'border-white/5 opacity-60'
                          }`}
                        >
                          {/* Top Row: Index Badge, Active Status, Action Buttons */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-gym-950 border border-white/10 text-gym-lime text-xs font-black flex items-center justify-center">
                                #{item.sortOrder || index + 1}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  isItemActive
                                    ? 'bg-gym-lime/10 text-gym-lime border border-gym-lime/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                }`}
                              >
                                {isItemActive ? 'ظاهر على الموقع' : 'مخفي مؤقتاً'}
                              </span>
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex items-center gap-2">
                              {/* Toggle Active Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFaqActive(item)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                                  isItemActive
                                    ? 'bg-gym-950 hover:bg-white/5 text-gray-300 border-white/10'
                                    : 'bg-gym-lime/10 hover:bg-gym-lime/20 text-gym-lime border-gym-lime/30'
                                }`}
                                title={isItemActive ? 'إخفاء من الموقع' : 'إظهار على الموقع'}
                              >
                                {isItemActive ? 'إخفاء' : 'تفعيل العرض'}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFaq(item);
                                  setShowFaqModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gym-850 hover:bg-gym-800 text-gym-lime font-bold text-xs border border-gym-lime/20 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>تعديل</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteFaq(item.id, item.questionAr)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>

                          {/* Question */}
                          <div className="space-y-1 mb-3">
                            <h4 className="text-base font-black text-white leading-snug">
                              {item.questionAr}
                            </h4>
                            {item.questionEn && item.questionEn !== item.questionAr && (
                              <p className="text-xs text-gray-400 font-medium" dir="ltr">
                                {item.questionEn}
                              </p>
                            )}
                          </div>

                          {/* Answer */}
                          <div className="p-4 rounded-2xl bg-gym-950/70 border border-white/5 space-y-2">
                            <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                              {item.answerAr}
                            </div>
                            {item.answerEn && item.answerEn !== item.answerAr && (
                              <div
                                className="text-[11px] text-gray-400 leading-relaxed border-t border-white/5 pt-2"
                                dir="ltr"
                              >
                                {item.answerEn}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: بيانات الاتصال */}
          {activeTab === 'contact' && settings && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">إدارة بيانات الاتصال وساعات العمل</h3>
                  <p className="text-xs text-gray-400">أرقام الهواتف، عنوان الفرع في مصر، ومواعيد الفتح والإغلاق</p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">الهاتف الأساسي</label>
                    <input
                      type="text"
                      value={settings.primaryPhone}
                      onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">رقم واتساب للتواصل المباشر</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">العنوان التفصيلي (عربي)</label>
                  <input
                    type="text"
                    value={settings.addressAr}
                    onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رابط Google Maps</label>
                  <input
                    type="url"
                    value={settings.googleMapsLink}
                    onChange={(e) => setSettings({ ...settings, googleMapsLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ساعات العمل (السبت - الخميس)</label>
                    <input
                      type="text"
                      value={settings.workingHoursAr.weekdays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHoursAr: { ...settings.workingHoursAr, weekdays: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ساعات العمل (الجمعة)</label>
                    <input
                      type="text"
                      value={settings.workingHoursAr.friday}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHoursAr: { ...settings.workingHoursAr, friday: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* بطاقة إدارة فترات ومواعيد تدريب الرجال والسيدات */}
              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                        <Clock className="w-5 h-5" />
                      </span>
                      <h4 className="text-lg font-black text-white">
                        مواعيد وفترات تدريب الرجال والسيدات (Gender Schedules)
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      تحكم كامل في مواعيد التمرين للرجال والنساء وساعات كل فترة، والتي تظهر تلقائياً للمتدرب عند اختيار الجنس في نافذة الاشتراك
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase hover:bg-lime-400 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ المواعيد</span>
                  </button>
                </div>

                {/* MEN'S SCHEDULES */}
                <div className="p-4 sm:p-5 rounded-xl bg-gym-950/70 border border-blue-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👨</span>
                      <div>
                        <h5 className="text-sm font-black text-blue-400">فترات تدريب الرجال (Men's Shifts)</h5>
                        <p className="text-[11px] text-gray-400">تظهر هذه المواعيد عندما يختار المشترك خيار "ذكر"</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddShift('men')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فترة للرجال</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {((settings.genderSchedules?.men && settings.genderSchedules.men.length > 0)
                      ? settings.genderSchedules.men
                      : [
                          { id: 'm1', labelAr: 'الصباحية (رجال)', labelEn: 'Morning', timeRangeAr: '06:00 ص – 10:00 ص', timeRangeEn: '06:00 AM – 10:00 AM' },
                          { id: 'm2', labelAr: 'الظهيرة (رجال)', labelEn: 'Afternoon', timeRangeAr: '02:00 م – 06:00 م', timeRangeEn: '02:00 PM – 06:00 PM' },
                          { id: 'm3', labelAr: 'المسائية (رجال)', labelEn: 'Evening', timeRangeAr: '06:00 م – 12:00 ص', timeRangeEn: '06:00 PM – 12:00 AM' },
                        ]
                    ).map((shift, idx) => (
                      <div
                        key={shift.id || `men-${idx}`}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-gym-900/90 border border-white/5"
                      >
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-400 mb-1">اسم الفترة</label>
                          <input
                            type="text"
                            value={shift.labelAr}
                            onChange={(e) => handleUpdateShift('men', idx, 'labelAr', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gym-950 border border-white/10 text-white text-xs font-bold"
                            placeholder="مثال: الصباحية (رجال)"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-400 mb-1">توقيت وساعات التدريب</label>
                          <input
                            type="text"
                            value={shift.timeRangeAr}
                            onChange={(e) => handleUpdateShift('men', idx, 'timeRangeAr', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gym-950 border border-white/10 text-blue-300 text-xs font-mono font-bold"
                            placeholder="مثال: 06:00 ص – 10:00 ص"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end items-end pt-2 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteShift('men', idx)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-colors"
                            title="حذف هذه الفترة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WOMEN'S SCHEDULES */}
                <div className="p-4 sm:p-5 rounded-xl bg-gym-950/70 border border-pink-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👩</span>
                      <div>
                        <h5 className="text-sm font-black text-pink-400">فترات تدريب السيدات (Ladies' Shifts)</h5>
                        <p className="text-[11px] text-gray-400">تظهر هذه المواعيد عندما تختار المشتركة خيار "أنثى" مع خصوصية تامة</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddShift('women')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فترة للسيدات</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {((settings.genderSchedules?.women && settings.genderSchedules.women.length > 0)
                      ? settings.genderSchedules.women
                      : [
                          { id: 'w1', labelAr: 'الصباحية (سيدات فقط)', labelEn: 'Morning', timeRangeAr: '10:00 ص – 02:00 م', timeRangeEn: '10:00 AM – 02:00 PM' },
                          { id: 'w2', labelAr: 'ما بعد الظهر (سيدات فقط)', labelEn: 'Afternoon', timeRangeAr: '03:00 م – 06:00 م', timeRangeEn: '03:00 PM – 06:00 PM' },
                          { id: 'w3', labelAr: 'المسائية (سيدات فقط)', labelEn: 'Evening', timeRangeAr: '08:00 م – 11:00 م', timeRangeEn: '08:00 PM – 11:00 PM' },
                        ]
                    ).map((shift, idx) => (
                      <div
                        key={shift.id || `women-${idx}`}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-gym-900/90 border border-white/5"
                      >
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-400 mb-1">اسم الفترة</label>
                          <input
                            type="text"
                            value={shift.labelAr}
                            onChange={(e) => handleUpdateShift('women', idx, 'labelAr', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gym-950 border border-white/10 text-white text-xs font-bold"
                            placeholder="مثال: الصباحية (سيدات فقط)"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-gray-400 mb-1">توقيت وساعات التدريب</label>
                          <input
                            type="text"
                            value={shift.timeRangeAr}
                            onChange={(e) => handleUpdateShift('women', idx, 'timeRangeAr', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gym-950 border border-white/10 text-pink-300 text-xs font-mono font-bold"
                            placeholder="مثال: 10:00 ص – 02:00 م"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end items-end pt-2 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteShift('women', idx)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-colors"
                            title="حذف هذه الفترة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase hover:bg-lime-400 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ جدول مواعيد الفترات'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: التواصل الاجتماعي */}
          {activeTab === 'social' && settings && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-white">روابط التواصل الاجتماعي</h3>
                  <p className="text-xs text-gray-400">تحديث روابط إنستغرام وفيسبوك وتيك توك ويوتيوب</p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ الروابط'}</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <div className="p-3 rounded-xl bg-gym-lime/10 border border-gym-lime/30 text-xs text-gym-lime flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>يمكنك إدخال الرابط كاملاً أو اسم الحساب فقط (Handle)، وسيتم توجيه الزوار لحساباتكم مباشرة.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                    <span>رابط إنستغرام (Instagram)</span>
                    <span className="text-[11px] text-gray-400 font-mono">https://instagram.com/yourgym</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://www.instagram.com/gymleno أو gymleno"
                    value={settings.social.instagram.startsWith('#') ? settings.social.instagram.replace(/^#+/, '') : settings.social.instagram}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^#+/, '').trim();
                      setSettings({
                        ...settings,
                        social: { ...settings.social, instagram: val },
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:border-gym-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                    <span>رابط فيسبوك (Facebook)</span>
                    <span className="text-[11px] text-gray-400 font-mono">https://facebook.com/yourgym</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://www.facebook.com/gymleno أو gymleno"
                    value={settings.social.facebook.startsWith('#') ? settings.social.facebook.replace(/^#+/, '') : settings.social.facebook}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^#+/, '').trim();
                      setSettings({
                        ...settings,
                        social: { ...settings.social, facebook: val },
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:border-gym-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                    <span>رابط تيك توك (TikTok)</span>
                    <span className="text-[11px] text-gray-400 font-mono">https://tiktok.com/@yourgym</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://www.tiktok.com/@gymleno أو gymleno"
                    value={settings.social.tiktok.startsWith('#') ? settings.social.tiktok.replace(/^#+/, '') : settings.social.tiktok}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^#+/, '').trim();
                      setSettings({
                        ...settings,
                        social: { ...settings.social, tiktok: val },
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:border-gym-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                    <span>رابط يوتيوب (YouTube)</span>
                    <span className="text-[11px] text-gray-400 font-mono">https://youtube.com/@yourgym</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://www.youtube.com/@gymleno أو gymleno"
                    value={settings.social.youtube.startsWith('#') ? settings.social.youtube.replace(/^#+/, '') : settings.social.youtube}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^#+/, '').trim();
                      setSettings({
                        ...settings,
                        social: { ...settings.social, youtube: val },
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-mono focus:border-gym-lime"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: إعدادات الموقع والتصميم */}
          {activeTab === 'settings' && settings && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">إعدادات الهوية واللون الأساسي (Brand Theme)</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    تحكم كامل بلون الإبراز (Accent Color) لكامل الموقع وأزراره، واسم الجيم والشعار
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase shadow-lg shadow-gym-lime/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                </button>
              </div>

              {/* Main Settings Card */}
              <div className="p-6 rounded-3xl bg-gym-900 border border-white/10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">اسم الجيم بالعربية</label>
                    <input
                      type="text"
                      value={settings.gymNameAr}
                      onChange={(e) => setSettings({ ...settings, gymNameAr: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-gym-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">نص الشعار بالإنجليزية (Logo Text)</label>
                    <input
                      type="text"
                      value={settings.logoText}
                      onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs font-display font-black tracking-wider focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                </div>

                {/* Accent Color Section */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-sm font-black text-white">
                        لون الإبراز الأساسي لكامل الموقع (Accent Color)
                      </label>
                      <p className="text-xs text-gray-400">
                        اختر أي لون من الباقات المجهزة أو اختر لونك المخصص عبر أداة الألوان المفتوحة
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gym-950 border border-white/10">
                      <span
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: settings.accentColor || '#CCFF00' }}
                      />
                      <span className="font-mono text-xs font-bold uppercase text-white" dir="ltr">
                        {settings.accentColor || '#CCFF00'}
                      </span>
                    </div>
                  </div>

                  {/* Curated Presets Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {THEME_COLOR_PRESETS.map((c) => {
                      const isSelected =
                        (settings.accentColor || '').toLowerCase() === c.color.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, accentColor: c.color });
                            applyThemeColor(c.color);
                            showToast(`تم اختيار ${c.nameAr} - يمكنك حفظه الآن`);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border text-right transition-all group ${
                            isSelected
                              ? 'border-white bg-gym-850 shadow-lg shadow-white/5 ring-1 ring-white/50'
                              : 'border-white/5 bg-gym-950/60 hover:bg-gym-950 hover:border-white/20'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                            style={{ backgroundColor: c.color }}
                          >
                            {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-black text-white truncate">{c.nameAr}</span>
                            <span className="block text-[10px] text-gray-400 truncate">{c.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Picker & Manual Hex Input */}
                  <div className="p-4 rounded-2xl bg-gym-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-white block">اختيار لون مخصص بحرية (Custom Color)</span>
                      <span className="text-[11px] text-gray-400">انقر على المربع لاختيار أي درجة لونية تريدها</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gym-900 border border-white/10 w-full sm:w-auto">
                        <input
                          type="color"
                          value={settings.accentColor || '#CCFF00'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings({ ...settings, accentColor: val });
                            applyThemeColor(val);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                          title="اختر لوناً مخصصاً"
                        />
                        <input
                          type="text"
                          value={settings.accentColor || '#CCFF00'}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                            setSettings({ ...settings, accentColor: val });
                            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                              applyThemeColor(val);
                            }
                          }}
                          className="w-24 px-2 py-1 bg-transparent text-xs font-mono font-bold text-white uppercase focus:outline-none"
                          dir="ltr"
                          placeholder="#CCFF00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Color Preview Card */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">معاينة مباشرة في الموقع (Live Preview)</h4>
                      <p className="text-[11px] text-gray-400">
                        هكذا ستظهر الأزرار والشارات والنصوص المميزة في صفحات الموقع للمشتركين
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-gym-lime">معاينة تفاعلية</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-5">
                    {/* Header Preview */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gym-lime text-black font-black flex items-center justify-center text-xs shadow-md shadow-gym-lime/20">
                          GL
                        </div>
                        <span className="font-display font-black text-white text-base">
                          GYM <span className="text-gym-lime">&</span> LENO
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/10 text-gym-lime border border-gym-lime/30">
                        باقة مميزة VIP
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white font-display">1,500</span>
                          <span className="text-gym-lime font-bold text-xs uppercase">جنيه مصري / 3 شهور</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <div className="w-4 h-4 rounded-full bg-gym-lime/20 text-gym-lime flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>دخول غير محدود لجميع الصالات والأجهزة الرياضية</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-gym-lime text-black font-black text-xs shadow-lg shadow-gym-lime/30 hover:scale-105 transition-all"
                        >
                          اشترك الآن
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-xl border border-gym-lime/40 text-gym-lime hover:bg-gym-lime/10 font-bold text-xs transition-colors"
                        >
                          تفاصيل الباقة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gym-lime text-black font-extrabold text-xs uppercase shadow-xl shadow-gym-lime/25 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveLoading ? 'جاري الحفظ...' : 'حفظ الهوية وتطبيق اللون على الموقع'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: الحساب والأمان */}
          {activeTab === 'security' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-xl font-black text-white">الأمان وإدارة حساب المدير</h3>
                <p className="text-xs text-gray-400">حماية لوحة التحكم والنسخ الاحتياطي لقاعدة البيانات</p>
              </div>

              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <h4 className="text-sm font-black text-gym-lime">تنزيل نسخة احتياطية كاملة (Backup)</h4>
                <p className="text-xs text-gray-300">
                  يمكنك تحميل نسخة JSON كاملة من قاعدة بيانات الموقع (الأعضاء، الاشتراكات، المحتوى، والوسائط) وحفظها بأمان على جهازك.
                </p>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
                      JSON.stringify({ content, video, plans, paymentMethods, members, bookings, trainers, programs, settings }, null, 2)
                    );
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `gym_leno_backup_${new Date().toISOString().split('T')[0]}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showToast('تم تحميل النسخة الاحتياطية بنجاح');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gym-800 hover:bg-gym-700 text-white font-bold text-xs border border-white/10"
                >
                  تحميل نسخة احتياطية JSON الآن
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gym-900 border border-white/10 space-y-4">
                <h4 className="text-sm font-black text-gym-lime">بيانات الاعتماد الحالية</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>اسم المستخدم: <span className="font-mono font-bold text-white">admin</span></div>
                  <div>صلاحية الحساب: <span className="font-bold text-green-400">مدير النظام الأعلى (Super Admin)</span></div>
                  <div>جلسة الدخول: <span className="font-bold text-gym-lime">محمية بتوكن أمان مشفر</span></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Dynamic Modals */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        media={media}
        filterType={mediaPickerType}
        title={mediaPickerTitle}
        onSelect={(url) => {
          if (mediaPickerCallback) mediaPickerCallback(url);
        }}
      />

      <TrainerModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        trainer={editingTrainer}
        onSave={handleSaveTrainer}
        onUpload={handleUploadFile}
      />

      <ProgramModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        program={editingProgram}
        trainers={trainers}
        onSave={handleSaveProgram}
        onUpload={handleUploadFile}
      />

      <TestimonialModal
        isOpen={showTestimonialModal}
        onClose={() => setShowTestimonialModal(false)}
        testimonial={editingTestimonial}
        onSave={handleSaveTestimonial}
        onUpload={handleUploadFile}
      />

      <FAQModal
        isOpen={showFaqModal}
        onClose={() => {
          setShowFaqModal(false);
          setEditingFaq(null);
        }}
        faq={editingFaq}
        onSave={handleSaveFaq}
      />

      <EditBookingModal
        isOpen={showEditBookingModal}
        onClose={() => {
          setShowEditBookingModal(false);
          setEditingBooking(null);
        }}
        booking={editingBooking}
        plans={plans}
        trainers={trainers}
        paymentMethods={paymentMethods}
        onSave={handleSaveBookingEdit}
      />

      {/* Lightbox Modal for Payment Proof Screenshot */}
      {previewProofBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gym-950 border border-gym-lime/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gym-900/60">
              <div>
                <span className="text-xs text-gym-lime font-mono font-bold block">
                  كود الطلب: {previewProofBooking.orderCode}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  إشعار وسكرين شوت تحويل المشترك ({previewProofBooking.customerName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProofBooking(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Order quick metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gym-900/70 border border-white/5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">المبلغ المطلوب:</span>
                  <span className="font-black text-gym-lime text-sm block">
                    {previewProofBooking.totalAmountEGP.toLocaleString()} ج.م
                  </span>
                  {previewProofBooking.trainerFeeEGP && previewProofBooking.trainerFeeEGP > 0 ? (
                    <span className="text-[10px] text-gray-400 block">
                      ({previewProofBooking.planPriceEGP || (previewProofBooking.totalAmountEGP - previewProofBooking.trainerFeeEGP)} باقة + {previewProofBooking.trainerFeeEGP} مدرب)
                    </span>
                  ) : null}
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">طريقة الدفع:</span>
                  <span className="font-bold text-white">
                    {paymentMethods.find((pm) => pm.id === previewProofBooking.paymentMethodId)?.nameAr || previewProofBooking.paymentMethodId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">رقم الهاتف:</span>
                  <span className="font-mono text-gray-200">{previewProofBooking.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">تاريخ بداية الاشتراك:</span>
                  <span className="font-mono text-white text-xs font-bold">
                    {previewProofBooking.startDate || (previewProofBooking.createdAt ? previewProofBooking.createdAt.split('T')[0] : '—')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">تاريخ انتهاء الاشتراك:</span>
                  <span className="font-mono text-gym-lime text-xs font-bold">
                    {previewProofBooking.endDate || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">كود العملية / الإشعار:</span>
                  <span className="font-mono text-gray-300">{previewProofBooking.transactionRef || 'غير محدد'}</span>
                </div>
              </div>

              {/* High-res Image preview */}
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center p-2 min-h-[300px]">
                {previewProofBooking.proofImageUrl ? (
                  <img
                    src={previewProofBooking.proofImageUrl}
                    alt="Proof screenshot"
                    className="max-h-[60vh] max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    لا توجد صورة إشعار مرفقة مع هذا الطلب
                  </div>
                )}
              </div>

              {previewProofBooking.proofImageUrl && (
                <div className="text-center">
                  <a
                    href={previewProofBooking.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gym-lime transition-colors underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح الصورة الأصلية بالحجم الكامل في نافذة جديدة</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-white/10 bg-gym-900/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewProofBooking(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
              >
                إغلاق
              </button>

              {previewProofBooking.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateBookingStatus(previewProofBooking.id, 'rejected');
                      setPreviewProofBooking(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs transition-colors"
                  >
                    رفض الطلب
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateBookingStatus(previewProofBooking.id, 'approved');
                      setPreviewProofBooking(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs transition-colors shadow-lg shadow-green-500/20"
                  >
                    اعتماد وتفعيل الاشتراك الآن
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
