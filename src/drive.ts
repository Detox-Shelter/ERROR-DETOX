import { BrainstormingSession, DriveFile } from './types';

// List worksheet files from Google Drive
export const listWorksheetFiles = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='application/json'+and+trashed=false&orderBy=modifiedTime+desc&fields=files(id,name,modifiedTime)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive 파일 검색 실패: ${errText}`);
    }

    const data = await response.json();
    const files: DriveFile[] = data.files || [];
    // Only return files that look like our brainstorming sessions
    return files.filter(f => f.name.startsWith('Service_SW_Worksheet_') || f.name.includes('Brainstorming_Worksheet'));
  } catch (error) {
    console.error('listWorksheetFiles error:', error);
    throw error;
  }
};

// Save worksheet file (either create new or update existing)
export const saveWorksheetFile = async (
  accessToken: string,
  session: BrainstormingSession,
  existingFileId?: string
): Promise<{ id: string; name: string }> => {
  try {
    const filename = `Service_SW_Worksheet_${session.title.replace(/[^a-zA-Z0-9가-힣\s_-]/g, '')}.json`;
    let fileId = existingFileId;

    if (!fileId) {
      // Step 1: Create metadata
      const metaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: filename,
          mimeType: 'application/json',
        }),
      });

      if (!metaRes.ok) {
        const errText = await metaRes.text();
        throw new Error(`파일 생성 실패: ${errText}`);
      }

      const fileData = await metaRes.json();
      fileId = fileData.id;
    } else {
      // Update metadata (filename) if file exists
      const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: filename,
        }),
      });

      if (!metaRes.ok) {
        const errText = await metaRes.text();
        console.warn(`파일명 업데이트 실패 (계속 진행): ${errText}`);
      }
    }

    if (!fileId) {
      throw new Error('유효한 Google Drive File ID가 없습니다.');
    }

    // Step 2: Upload or patch the content as media
    const contentRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...session,
          id: fileId, // Save the actual Drive File ID inside
        }),
      }
    );

    if (!contentRes.ok) {
      const errText = await contentRes.text();
      throw new Error(`파일 내용 저장 실패: ${errText}`);
    }

    return { id: fileId, name: filename };
  } catch (error) {
    console.error('saveWorksheetFile error:', error);
    throw error;
  }
};

// Load content of a specific file
export const loadWorksheetFile = async (
  accessToken: string,
  fileId: string
): Promise<BrainstormingSession> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`파일 불러오기 실패: ${errText}`);
    }

    const session: BrainstormingSession = await response.json();
    return {
      ...session,
      id: fileId, // Ensure ID is mapped correctly
    };
  } catch (error) {
    console.error('loadWorksheetFile error:', error);
    throw error;
  }
};

// Delete a worksheet file
export const deleteWorksheetFile = async (accessToken: string, fileId: string): Promise<void> => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`파일 삭제 실패: ${errText}`);
    }
  } catch (error) {
    console.error('deleteWorksheetFile error:', error);
    throw error;
  }
};
