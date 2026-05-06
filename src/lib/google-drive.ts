// Google Drive API integration for per-user cloud backup
// Uses Google Identity Services (GIS) for OAuth2

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const APP_FOLDER_NAME = 'متابع_الصلاة_Backups';
const BACKUP_MIME_TYPE = 'application/json';

// Storage keys
const GD_TOKEN_KEY = 'gd-access-token';
const GD_CLIENT_ID_KEY = 'gd-client-id';
const GD_LAST_BACKUP_KEY = 'gd-last-backup';

export interface BackupInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size: string;
}

export function getStoredClientId(): string {
  return storageGet(GD_CLIENT_ID_KEY) || '';
}

export function setStoredClientId(clientId: string) {
  storageSet(GD_CLIENT_ID_KEY, clientId);
}

export function getLastBackupDate(): string | null {
  return storageGet(GD_LAST_BACKUP_KEY);
}

function setLastBackupDate(date: string) {
  storageSet(GD_LAST_BACKUP_KEY, date);
}

function getStoredToken(): string | null {
  return sessionStorage.getItem(GD_TOKEN_KEY);
}

function setStoredToken(token: string) {
  sessionStorage.setItem(GD_TOKEN_KEY, token);
}

export function clearGoogleAuth() {
  sessionStorage.removeItem(GD_TOKEN_KEY);
}

export function isGoogleConnected(): boolean {
  return !!sessionStorage.getItem(GD_TOKEN_KEY);
}

// Load Google Identity Services script
let gisLoaded = false;
export function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.getElementById('gis-script')) {
      gisLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => { gisLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('فشل تحميل خدمات Google'));
    document.head.appendChild(script);
  });
}

// Authenticate with Google
export async function authenticateGoogle(): Promise<string> {
  const clientId = getStoredClientId();
  if (!clientId) throw new Error('يرجى إدخال Google Client ID أولاً');
  
  await loadGIS();
  
  return new Promise((resolve, reject) => {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description || 'فشل المصادقة'));
          return;
        }
        setStoredToken(response.access_token);
        resolve(response.access_token);
      },
      error_callback: (error: any) => {
        reject(new Error(error.message || 'فشل المصادقة'));
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

// Get or re-use existing token
async function getAccessToken(): Promise<string> {
  const token = getStoredToken();
  if (token) {
    // Verify token is still valid
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token);
      if (res.ok) return token;
    } catch { /* token expired */ }
  }
  return authenticateGoogle();
}

// Find or create app backup folder
async function getOrCreateFolder(token: string): Promise<string> {
  // Search for existing folder
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!searchRes.ok) throw new Error('فشل البحث في Google Drive');
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  
  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  
  if (!createRes.ok) throw new Error('فشل إنشاء مجلد النسخ الاحتياطي');
  const folder = await createRes.json();
  return folder.id;
}

// Upload backup to Google Drive
export async function uploadBackup(jsonData: string): Promise<void> {
  const token = await getAccessToken();
  const folderId = await getOrCreateFolder(token);
  
  const now = new Date();
  const fileName = `salat-tracker-backup-${now.toISOString().slice(0, 10)}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.json`;
  
  const metadata = {
    name: fileName,
    mimeType: BACKUP_MIME_TYPE,
    parents: [folderId],
  };
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([jsonData], { type: BACKUP_MIME_TYPE }));
  
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`فشل رفع النسخة الاحتياطية: ${err}`);
  }
  
  setLastBackupDate(now.toISOString());
}

// List available backups
export async function listBackups(): Promise<BackupInfo[]> {
  const token = await getAccessToken();
  const folderId = await getOrCreateFolder(token);
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false and mimeType='application/json'&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size)&pageSize=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!res.ok) throw new Error('فشل جلب قائمة النسخ الاحتياطية');
  const data = await res.json();
  
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
    size: f.size || '0',
  }));
}

// Download a specific backup
export async function downloadBackup(fileId: string): Promise<string> {
  const token = await getAccessToken();
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!res.ok) throw new Error('فشل تحميل النسخة الاحتياطية');
  return res.text();
}

// Delete a backup
export async function deleteBackup(fileId: string): Promise<void> {
  const token = await getAccessToken();
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!res.ok) throw new Error('فشل حذف النسخة الاحتياطية');
}
