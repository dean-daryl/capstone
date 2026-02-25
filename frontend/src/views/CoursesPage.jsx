import React, { useEffect, useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

function CoursesPage() {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/courses')
      .then((res) => {
        if (res.data?.data) {
          setCourses(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-100">Courses</h1>
        </div>
        {(role === 'TEACHER' || role === 'ADMIN') && (
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
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
              <div
                key={course.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-100">{course.name}</h3>
                <p className="text-sm text-gray-400 mt-1">Code: {course.code}</p>
                {course.cohort && (
                  <p className="text-sm text-gray-400">Cohort: {course.cohort}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
