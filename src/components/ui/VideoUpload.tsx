import React, { useState } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  existingUrl?: string;
  label?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadSuccess,
  onRemove,
  existingUrl,
  label = 'Upload Video',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState(existingUrl || '');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only MP4, WEBM, and MOV videos are allowed');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/return-evidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      const uploadedUrl = response.data.url;
      setVideoUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to upload video';
      setError(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setVideoUrl('');
    setError('');
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {!videoUrl && !uploading && (
        <Paper
          sx={{
            p: 2,
            border: '2px dashed #ccc',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          component="label"
        >
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <VideoIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MP4, WEBM, MOV (max 50MB)
          </Typography>
        </Paper>
      )}

      {uploading && (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading video... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {videoUrl && !uploading && (
        <Paper sx={{ p: 1, position: 'relative' }}>
          <video
            src={videoUrl}
            controls
            style={{
              width: '100%',
              maxHeight: 300,
              borderRadius: 4,
            }}
          />
          <IconButton
            size="small"
            color="error"
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'white',
              '&:hover': { bgcolor: 'error.light', color: 'white' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default VideoUpload;
