import React, { useState } from 'react';
import { Exercise } from '../types';
import { Dumbbell, Plus, Search, Video, Play, Trash2, Edit2 } from 'lucide-react';
import { uid } from '../data/seedData';

interface ExercisesTabProps {
  exercises: Exercise[];
  onAddExercise: (ex: Exercise) => void;
  onDeleteExercise: (id: string) => void;
}

export const ExercisesTab: React.FC<ExercisesTabProps> = ({
  exercises,
  onAddExercise,
  onDeleteExercise,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [bodyPart, setBodyPart] = useState('Cổ');
  const [description, setDescription] = useState('');
  const [setsReps, setSetsReps] = useState('10 lần x 3 hiệp');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx: Exercise = {
      id: uid('EX'),
      name,
      bodyPart,
      description,
      setsReps,
      videoUrl,
    };
    onAddExercise(newEx);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setVideoUrl('');
  };

  const filtered = exercises.filter((ex) => {
    const matchQuery =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    const matchPart =
      selectedBodyPart === 'all' || ex.bodyPart === selectedBodyPart;
    return matchQuery && matchPart;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Thư Viện Bài Tập Phục Hồi Tại Nhà
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ định bài tập cho bệnh nhân theo từng vùng đau, kèm video hướng dẫn khoa học
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Bài Tập Mới</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bài tập..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả vùng</option>
            <option value="Cổ">Cổ</option>
            <option value="Thắt lưng">Thắt lưng</option>
            <option value="Khớp gối">Khớp gối</option>
            <option value="Lưng trên">Lưng trên</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">
            ({filtered.length} bài)
          </span>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {ex.bodyPart}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xóa bài tập ${ex.name}?`)) {
                      onDeleteExercise(ex.id);
                    }
                  }}
                  className="text-slate-300 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {ex.name}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {ex.description}
              </p>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                Hiệp / Lần: <span className="text-blue-600">{ex.setsReps}</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {ex.videoUrl ? (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Xem Video Hướng Dẫn</span>
                </a>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  Chưa gắn video
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Exercise */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm Bài Tập Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Bài Tập
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Kéo giãn cơ thang trên..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Vùng Áp Dụng
                </label>
                <select
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="Cổ">Cổ</option>
                  <option value="Thắt lưng">Thắt lưng</option>
                  <option value="Khớp gối">Khớp gối</option>
                  <option value="Lưng trên">Lưng trên</option>
                  <option value="Khớp vai">Khớp vai</option>
                  <option value="Cổ chân">Cổ chân</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mô Tả Cách Tập
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả từng bước thực hiện..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Hiệp / Lần
                  </label>
                  <input
                    type="text"
                    required
                    value={setsReps}
                    onChange={(e) => setSetsReps(e.target.value)}
                    placeholder="10 lần x 3 hiệp"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Link Video (Youtube...)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
                >
                  Lưu Bài Tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
