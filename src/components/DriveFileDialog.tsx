import { useState, useEffect } from 'react';
import { DriveFile } from '../types';
import { listWorksheetFiles, deleteWorksheetFile } from '../drive';
import { X, FileText, Trash2, ArrowUpRight, Loader, AlertTriangle } from 'lucide-react';

interface DriveFileDialogProps {
  accessToken: string | null;
  onClose: () => void;
  onSelectFile: (fileId: string) => void;
}

export default function DriveFileDialog({ accessToken, onClose, onSelectFile }: DriveFileDialogProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listWorksheetFiles(accessToken);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to fetch files from Drive', err);
      setError('Google Drive 파일 목록을 가져오는 중 오류가 발생했습니다. 권한 범위를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [accessToken]);

  const handleDelete = async (fileId: string, filename: string) => {
    if (!accessToken) return;

    // MANDATORY USER CONFIRMATION before destructive operation
    const confirmed = window.confirm(`정말 Google Drive에서 '${filename}' 워크시트를 영구히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;

    setIsDeletingId(fileId);
    try {
      await deleteWorksheetFile(accessToken, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`파일 삭제 실패: ${err.message || err}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-950/40 backdrop-blur-xs p-4 animate-fade-in" id="drive-dialog-overlay">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden" id="drive-dialog-container">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" id="drive-dialog-header">
          <div>
            <h3 className="text-sm font-bold text-gray-950">내 Google Drive 워크시트 보관함</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">drive.file scope (이 앱이 생성한 JSON 파일만 조회됩니다)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 min-h-[250px] flex flex-col" id="drive-dialog-list">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-gray-500">
              <Loader className="w-6 h-6 animate-spin text-gray-900" />
              <span className="text-2xs font-medium font-mono">Drive 검색 중...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-red-500 space-y-2">
              <AlertTriangle className="w-8 h-8 shrink-0 text-red-500" />
              <span className="text-xs font-semibold">{error}</span>
              <button
                onClick={fetchFiles}
                className="mt-2 px-3 py-1.5 border border-red-200 text-3xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
              <FileText className="w-8 h-8 shrink-0 text-gray-200" />
              <span className="text-xs font-semibold text-gray-500">클라우드 보관함이 비어있습니다.</span>
              <p className="text-3xs text-gray-400 max-w-xs">
                현재 브레인스토밍을 완료한 뒤 우측 상단 'Drive에 저장' 혹은 Step 5 '최종 저장' 단추를 통해 첫 번째 문서를 업로드해 보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const cleanName = file.name
                  .replace('Service_SW_Worksheet_', '')
                  .replace('.json', '')
                  .replace(/_/g, ' ');

                const isDeleting = isDeletingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-gray-50 text-gray-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-2xs font-bold text-gray-900 truncate">
                          {cleanName || '이름 없는 워크시트'}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                          수정일: {new Date(file.modifiedTime).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-3">
                      <button
                        onClick={() => onSelectFile(file.id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-950 text-white hover:bg-gray-800 rounded-lg text-3xs font-semibold transition-all cursor-pointer"
                      >
                        <span>열기</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDelete(file.id, file.name)}
                        disabled={isDeleting}
                        className="p-1.5 border border-gray-150 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
                        title="보관함에서 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
