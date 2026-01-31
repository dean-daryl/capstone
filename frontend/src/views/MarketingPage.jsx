import React from 'react';
import { Brain, Camera, Video, FileText, Chrome, Sparkles, Check, Bot } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/AuthModals';


function MarketingPage() {
  const { isLoginOpen, isRegisterOpen, openLogin, openRegister, closeModals } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Bot className="w-12 h-12 text-purple-400" />
              <h1 className="text-4xl font-bold">SomaTek AI</h1>
            </div>
            <p className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Transform Any Content Into Text
            </p>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Instantly transcribe images, videos, and text with our powerful AI-powered Chrome extension.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-all">
                <Chrome className="w-5 h-5" />
                Add to Chrome
              </button>
              <button 
                onClick={openLogin}
                className="border border-gray-700 hover:border-purple-500 px-8 py-3 rounded-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Camera className="w-6 h-6 text-purple-400" />}
              title="Image Recognition"
              description="Extract text from images, screenshots, and photos with high accuracy"
            />
            <FeatureCard
              icon={<Video className="w-6 h-6 text-purple-400" />}
              title="Video Transcription"
              description="Convert video content into text in real-time with multiple language support"
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-purple-400" />}
              title="Text Processing"
              description="Process and organize text content with AI-powered formatting"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TranscribeAI?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/50">
              <img
                src="https://images.unsplash.com/photo-1712245833905-5057a4245271?q=80&w=3139&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="AI Technology"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-bold mb-4">Advanced AI Technology</h3>
              <ul className="space-y-3">
                {[
                  'State-of-the-art machine learning models',
                  '99% accuracy in transcription',
                  'Real-time processing capabilities',
                  'Multi-language support'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/50">
              <img
                src="https://images.unsplash.com/photo-1648301033733-44554c74ec50?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Productivity"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-bold mb-4">Boost Your Productivity</h3>
              <ul className="space-y-3">
                {[
                  'Save hours on manual transcription',
                  'Easy-to-use browser extension',
                  'Instant results with one click',
                  'Seamless workflow integration'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800/50 to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users who are already saving time with TranscribeAI
          </p>
          <button 
            onClick={openRegister}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition-all"
          >
            <Chrome className="w-5 h-5" />
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2024 TranscribeAI. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
       isOpen={isLoginOpen}
        onClose={() => { closeModals();}}
        onModalSwitch={() =>{
            closeModals();
            openRegister();
        }}
        type="login" />
      <AuthModal
       isOpen={isRegisterOpen}
       onClose={() => {
         closeModals();
        }}
        onModalSwitch ={() =>{
            closeModals();
            openLogin();
        }}
        type="register" />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
      <div className="bg-gray-700/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default MarketingPage;