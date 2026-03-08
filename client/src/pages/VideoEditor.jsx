import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader.jsx';
import { api } from '../services/api';

export default function VideoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    loadScript();
  }, [id]);

  const loadScript = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load the script for this document
      const response = await api.get(`/document/${id}/script`);
      setScript(response.data);
      setUseFallback(false);
    } catch (err) {
      console.error('Failed to load script:', err);
      setError(err.response?.data?.detail || 'Failed to load script');
      // Don't automatically load fallback, let user decide
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackScript = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate and save fallback script for this document
      const response = await api.post(`/generate-fallback-script/${id}`);
      setScript(response.data);
      setUseFallback(true);
    } catch (err) {
      console.error('Failed to load fallback script:', err);
      setError(err.response?.data?.detail || 'Failed to load fallback script');
    } finally {
      setLoading(false);
    }
  };

  const parseScenes = (narrationScript) => {
    if (!narrationScript) return [];
    
    // Split by "Scene X:" pattern
    const scenePattern = /Scene\s+(\d+):\s*/gi;
    const parts = narrationScript.split(scenePattern);
    
    const scenes = [];
    for (let i = 1; i < parts.length; i += 2) {
      const sceneNumber = parts[i];
      const sceneText = parts[i + 1]?.trim();
      if (sceneText) {
        scenes.push({
          number: parseInt(sceneNumber),
          text: sceneText
        });
      }
    }
    
    return scenes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error && !script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Script</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={loadScript}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
              <button
                onClick={loadFallbackScript}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Load Demo Script
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">No script available</p>
          <button
            onClick={loadFallbackScript}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Load Demo Script
          </button>
        </div>
      </div>
    );
  }

  const scenes = parseScenes(script.narration_script);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            {useFallback && (
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-sm">
                Demo Script
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{script.title}</h1>
          <div className="flex gap-4 text-gray-400 text-sm">
            <span>Duration: {script.estimated_duration}</span>
            <span>•</span>
            <span>Audience: {script.target_audience}</span>
            <span>•</span>
            <span>{scenes.length} Scenes</span>
          </div>
        </div>

        {/* Script Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hook */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Hook</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{script.hook}</p>
          </div>

          {/* Introduction */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Introduction</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{script.introduction}</p>
          </div>

          {/* Conclusion */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Conclusion</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{script.conclusion}</p>
          </div>
        </div>

        {/* Main Sections */}
        {script.main_sections && script.main_sections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Main Sections</h2>
            <div className="space-y-4">
              {script.main_sections.map((section, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">{section.heading}</h3>
                  <p className="text-gray-400 text-sm mb-3 italic">{section.summary}</p>
                  <p className="text-gray-300 leading-relaxed">{section.narration}</p>
                  {section.suggested_visuals && section.suggested_visuals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Suggested Visuals:</p>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        {section.suggested_visuals.map((visual, vIndex) => (
                          <li key={vIndex}>{visual}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scene Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Scene Breakdown</h2>
          <div className="space-y-4">
            {scenes.map((scene) => (
              <div key={scene.number} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{scene.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Scene {scene.number}</h3>
                    <p className="text-gray-300 leading-relaxed">{scene.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        {script.key_takeaways && script.key_takeaways.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Key Takeaways</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <ul className="space-y-3">
                {script.key_takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Visual Cues */}
        {script.visual_cues && script.visual_cues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Visual Cues</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {script.visual_cues.map((cue, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-300 text-sm">{cue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            Continue to Video Generation
          </button>
          {!useFallback && (
            <button
              onClick={loadFallbackScript}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Load Demo Script
            </button>
          )}
          {useFallback && (
            <button
              onClick={loadScript}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Load Original Script
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
