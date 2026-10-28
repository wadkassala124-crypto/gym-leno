const fs = require('fs');
const path = 'src/app/admin/page.tsx';

let code = fs.readFileSync(path, 'utf8');

// The block that was duplicated 12 times
const tabBlock = `

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
          )}`;

// Remove all occurrences
while (code.includes(tabBlock)) {
  code = code.replace(tabBlock, '');
}

// Insert it cleanly ONCE right before {/* TAB 10: بيانات الاتصال */}
const targetAnchor = '{/* TAB 10: بيانات الاتصال */}';
if (code.includes(targetAnchor)) {
  code = code.replace(targetAnchor, tabBlock.trim() + '\n\n          ' + targetAnchor);
  console.log('Successfully inserted Testimonials tab cleanly!');
} else {
  console.error('Target anchor not found!');
}

// Add <TestimonialModal /> before </main> or next to ProgramModal
const programModalAnchor = '</ProgramModal>'; // wait, let's check how ProgramModal is closed
if (code.includes('<ProgramModal')) {
  const modalTag = `      <TestimonialModal
        isOpen={showTestimonialModal}
        onClose={() => setShowTestimonialModal(false)}
        testimonial={editingTestimonial}
        onSave={handleSaveTestimonial}
        onUpload={handleUploadFile}
      />\n\n`;

  const pmIndex = code.indexOf('/>\n\n    </div>');
  if (pmIndex !== -1) {
    code = code.slice(0, pmIndex + 2) + '\n\n' + modalTag + code.slice(pmIndex + 2);
    console.log('Successfully appended TestimonialModal!');
  } else {
    console.log('pmIndex not found, searching for ProgramModal end');
    code = code.replace('/>\n\n    </div>', '/>\n\n' + modalTag + '    </div>');
  }
}

fs.writeFileSync(path, code, 'utf8');
console.log('File updated successfully.');
