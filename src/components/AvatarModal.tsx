import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoURL: string;
  onSave: (photoURL: string) => Promise<void>;
}

const PRESET_AVATARS = [
  {
    name: '새싹 정원사',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: '울창한 숲',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: '안식처 장미',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    name: '생명수 물뿌리개',
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=150&h=150&q=80',
  },
];

export default function AvatarModal({ isOpen, onClose, currentPhotoURL, onSave }: AvatarModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'preset'>('preset');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhotoURL);
  const [isSaving, setIsSaving] = useState(false);

  // Camera stream states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up stream on unmount or tab change
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // Handle stream initialization when switching to camera tab
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
      setCapturedImage(null);
    }
  }, [activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('카메라를 활성화할 수 없습니다. 권한 설정을 확인하세요.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror effect for natural selfie look
      ctx.translate(320, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      setSelectedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('이미지 크기는 최대 2MB까지 가능합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setSelectedPhoto(resultStr);
          setCapturedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedPhoto);
      onClose();
    } catch (err) {
      console.error('Failed to save avatar:', err);
      alert('프로필 이미지 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" id="avatar-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FAF9F5] border border-emerald-100 rounded-3xl p-6 max-w-sm w-full shadow-lg flex flex-col space-y-5"
        id="avatar-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-100 rounded-xl text-emerald-800">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-emerald-950 tracking-tight">프로필 이미지 변경</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-emerald-50 text-emerald-800/60 hover:text-emerald-950 transition-colors cursor-pointer"
            id="close-avatar-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Preview Sphere */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative group w-20 h-20 rounded-full border-2 border-emerald-600/20 p-1 bg-white/80 shadow-3xs flex items-center justify-center">
            <img
              src={selectedPhoto}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
              id="avatar-preview-img"
            />
          </div>
          <span className="text-[10px] text-emerald-800/60 font-bold uppercase tracking-wider font-mono">가드너의 새 얼굴</span>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-1 bg-emerald-900/5 p-1 rounded-xl border border-emerald-100/40">
          <button
            onClick={() => setActiveTab('preset')}
            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'preset' ? 'bg-white text-emerald-950 shadow-4xs' : 'text-emerald-800/60 hover:text-emerald-800'
            }`}
          >
            기본 아바타
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-emerald-950 shadow-4xs' : 'text-emerald-800/60 hover:text-emerald-800'
            }`}
          >
            이미지 업로드
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'camera' ? 'bg-white text-emerald-950 shadow-4xs' : 'text-emerald-800/60 hover:text-emerald-800'
            }`}
          >
            카메라 촬영
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-white/40 border border-emerald-100/40 p-4 rounded-2xl min-h-[160px] flex flex-col justify-center">
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <span className="block text-[9px] font-extrabold text-emerald-800/60 uppercase tracking-widest text-center font-mono">
                엄선된 자연 일러스트
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.name}
                    onClick={() => setSelectedPhoto(avatar.url)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all shadow-4xs hover:scale-105 cursor-pointer ${
                      selectedPhoto === avatar.url ? 'border-emerald-700 ring-2 ring-emerald-500/20 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={avatar.name}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                    {selectedPhoto === avatar.url && (
                      <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center space-y-3 py-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="avatar-file-input"
              />
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-800">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-[10px] text-center text-emerald-800/60 font-semibold leading-relaxed">
                가드너를 대표할 나만의 이미지 파일을 선택해주세요. <br />
                <span className="text-[9px] font-mono text-emerald-800/40">(최대 용량 2MB)</span>
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 bg-emerald-900 text-white hover:bg-emerald-950 rounded-xl text-[10px] font-bold shadow-4xs cursor-pointer transition-all flex items-center space-x-1"
                id="trigger-file-select"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>기기에서 파일 선택</span>
              </button>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="flex flex-col items-center space-y-3">
              {stream ? (
                <div className="relative w-36 h-36 rounded-full overflow-hidden border border-emerald-200/80 shadow-3xs bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 border-4 border-emerald-950/20 rounded-full pointer-events-none" />
                </div>
              ) : capturedImage ? (
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-emerald-700 shadow-3xs bg-emerald-50">
                  <img src={capturedImage} alt="Captured snapshot" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <Camera className="w-7 h-7 text-emerald-800/50" />
                  <p className="text-[10px] text-emerald-800/60 font-semibold text-center leading-relaxed">
                    실시간 카메라를 활성화하여 <br />
                    아바타 전용 스냅샷을 촬영해보세요!
                  </p>
                </div>
              )}

              {cameraError && (
                <p className="text-[9px] text-red-600 font-bold text-center bg-red-50 px-2.5 py-1 rounded-lg">
                  {cameraError}
                </p>
              )}

              <div className="flex items-center space-x-1.5">
                {!stream ? (
                  <button
                    onClick={startCamera}
                    className="px-4 py-1.5 bg-emerald-900 text-white hover:bg-emerald-950 rounded-xl text-[10px] font-bold shadow-4xs cursor-pointer transition-all flex items-center space-x-1"
                    id="start-camera-btn"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{capturedImage ? '다시 촬영하기' : '카메라 활성화'}</span>
                  </button>
                ) : (
                  <div className="flex space-x-1.5">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-bold shadow-4xs cursor-pointer transition-all flex items-center space-x-1"
                      id="capture-snapshot-btn"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>찰칵! 촬영</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-2.5 py-1.5 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                      id="cancel-camera-btn"
                    >
                      끄기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-1">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            disabled={isSaving}
            className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
            id="avatar-cancel-action"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-[10px] font-bold transition-all shadow-3xs cursor-pointer text-center flex items-center justify-center space-x-1"
            id="avatar-save-action"
          >
            {isSaving ? (
              <span>저장 중...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>새 프로필 적용</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
