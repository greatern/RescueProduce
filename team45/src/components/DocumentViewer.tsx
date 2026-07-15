import { useState, useRef, useEffect } from 'react';
import { FileText, X, Download, RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerProps {
  documents: Record<string, string>;
  onClose: () => void;
}

const DocumentViewer = ({ documents, onClose }: DocumentViewerProps) => {
  const [activeDoc, setActiveDoc] = useState<string>(Object.keys(documents)[0]);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const docNames = Object.keys(documents);
  const currentIndex = docNames.indexOf(activeDoc);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % docNames.length;
    setActiveDoc(docNames[nextIndex]);
    setRotation(0);
    setZoom(1);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + docNames.length) % docNames.length;
    setActiveDoc(docNames[prevIndex]);
    setRotation(0);
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        ref={viewerRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-6xl ${isFullscreen ? 'h-full' : 'max-h-[90vh]'} flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Document Viewer</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-900"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Document sidebar */}
          <div className="w-64 border-r p-4 overflow-y-auto bg-gray-50">
            <h4 className="font-medium mb-3">Uploaded Files ({docNames.length})</h4>
            <ul className="space-y-1">
              {docNames.map((name) => (
                <li key={name}>
                  <button
                    onClick={() => {
                      setActiveDoc(name);
                      setRotation(0);
                      setZoom(1);
                    }}
                    className={`w-full text-left p-2 rounded flex items-center ${
                      activeDoc === name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">
                      {name.replace(/_/g, ' ').replace(/\.[^/.]+$/, '')}
                      <span className="text-gray-400 ml-1">
                        {name.split('.').pop()?.toUpperCase()}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Document preview */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrev}
                  disabled={docNames.length <= 1}
                  className={`p-1 rounded ${docNames.length <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleNext}
                  disabled={docNames.length <= 1}
                  className={`p-1 rounded ${docNames.length <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <h4 className="font-medium capitalize text-sm">
                  {activeDoc.replace(/_/g, ' ').replace(/\.[^/.]+$/, '')}
                </h4>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                    disabled={zoom <= 0.5}
                    className={`p-1 rounded ${zoom <= 0.5 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button 
                    onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
                    disabled={zoom >= 3}
                    className={`p-1 rounded ${zoom >= 3 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <a 
                  href={documents[activeDoc]} 
                  download
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4">
              {documents[activeDoc].endsWith('.pdf') ? (
                <div className="w-full h-full">
                  <iframe 
                    src={`${documents[activeDoc]}#view=fitH`}
                    className="w-full h-full min-h-[60vh] border"
                    title={activeDoc}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={documents[activeDoc]} 
                    alt={activeDoc}
                    className="max-w-full max-h-[70vh] object-contain shadow-md"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoom})`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;