import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Eye, FileText, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCourseById, deleteCourse, getCourseDocuments } from '../api/courseService';
import { uploadDocument, deleteDocument, getDocumentViewUrl, reprocessDocument } from '../api/ragService';
import { toast } from 'sonner';

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const fileInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 'course' | docId | null

  const canManage = role === 'TEACHER' || role === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, docsRes] = await Promise.all([
        getCourseById(id),
        getCourseDocuments(id),
      ]);
      if (courseRes?.data) setCourse(courseRes.data);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Poll for status updates when any document is still processing
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'UPLOADING' || d.status === 'PROCESSING'
    );
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const docsRes = await getCourseDocuments(id);
        if (docsRes?.data) setDocuments(docsRes.data);
      } catch {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadDocument(file, id);
      toast.success('Document uploaded — processing in background');
      // Refresh documents list to show the new doc with PROCESSING status
      const docsRes = await getCourseDocuments(id);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDocument(docId);
      toast.success('Document deleted');
      setDeleteConfirm(null);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      navigate('/dashboard/courses');
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await reprocessDocument(docId);
      toast.success('Reprocessing started');
      const docsRes = await getCourseDocuments(id);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch {
      toast.error('Failed to reprocess document');
    }
  };

  const handleViewDocument = async (docId) => {
    try {
      const res = await getDocumentViewUrl(docId);
      if (res?.data?.url) {
        window.open(res.data.url, '_blank');
      }
    } catch {
      toast.error('Failed to get document URL');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-600/20 text-green-300';
      case 'PROCESSING': case 'UPLOADING': return 'bg-yellow-600/20 text-yellow-300';
      case 'FAILED': return 'bg-red-600/20 text-red-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-8 px-4 text-center text-gray-400">
        <p>Course not found.</p>
        <button onClick={() => navigate('/dashboard/courses')} className="mt-4 text-purple-400 hover:underline">
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-200 mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{course.name}</h1>
              <div className="flex gap-4 text-sm text-gray-400 mt-1">
                <span>Code: {course.code}</span>
                {course.cohort && <span>Cohort: {course.cohort}</span>}
                {course.facilitatorName && <span>Facilitator: {course.facilitatorName}</span>}
              </div>
            </div>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setDeleteConfirm('course')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete Course
          </button>
        )}
      </div>

      {/* Upload Section */}
      {canManage && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              accept=".pdf,.txt,.docx,.pptx"
              className="hidden"
              id="file-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <span className="text-sm text-gray-400">Supported: PDF, TXT, DOCX, PPTX</span>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Documents ({documents.length})
          </h2>
        </div>
        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-700">
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-200">{doc.filename}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatSize(doc.fileSizeBytes)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{doc.chunkCount ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDocument(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-purple-400 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && doc.status === 'FAILED' && (
                          <button
                            onClick={() => handleReprocess(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-400 rounded transition-colors"
                            title="Reprocess"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => setDeleteConfirm(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-100 mb-2">
              {deleteConfirm === 'course' ? 'Delete Course' : 'Delete Document'}
            </h2>
            <p className="text-gray-400 mb-4">
              {deleteConfirm === 'course'
                ? 'This will permanently delete the course and all its documents. This action cannot be undone.'
                : 'This will permanently delete this document. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteConfirm === 'course'
                    ? handleDeleteCourse()
                    : handleDeleteDocument(deleteConfirm)
                }
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

export default CourseDetailPage;
