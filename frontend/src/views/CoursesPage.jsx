import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Trash2, FileText, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCourses, createCourse, deleteCourse } from '../api/courseService';
import { toast } from 'sonner';

function CoursesPage() {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', cohort: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const canManage = role === 'TEACHER' || role === 'ADMIN';

  const fetchCourses = () => {
    setLoading(true);
    getCourses()
      .then((res) => {
        if (res?.data) setCourses(res.data);
      })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    setCreating(true);
    try {
      await createCourse(formData);
      toast.success('Course created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', code: '', cohort: '' });
      fetchCourses();
    } catch {
      toast.error('Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      toast.success('Course deleted successfully');
      setDeleteConfirmId(null);
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-100">Courses</h1>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="relative group">
                <Link
                  to={`/dashboard/courses/${course.id}`}
                  className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-100">{course.name}</h3>
                    <span className="flex items-center gap-1 text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                      <FileText className="w-3 h-3" />
                      {course.documentCount ?? 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Code: {course.code}</p>
                  {course.cohort && (
                    <p className="text-sm text-gray-400">Cohort: {course.cohort}</p>
                  )}
                  {course.facilitatorName && (
                    <p className="text-xs text-gray-500 mt-2">By {course.facilitatorName}</p>
                  )}
                </Link>
                {canManage && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirmId(course.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800/80 text-gray-400 hover:text-red-400 hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-100">Create Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Introduction to CS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Course Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cohort</label>
                <input
                  type="text"
                  value={formData.cohort}
                  onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. 2026"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-100 mb-2">Delete Course</h2>
            <p className="text-gray-400 mb-4">
              This will permanently delete the course and all its documents. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
