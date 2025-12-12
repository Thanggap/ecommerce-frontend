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
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  existingUrl?: string;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onRemove,
  existingUrl,
  label = 'Upload Image',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(existingUrl || '');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WEBP, and GIF images are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
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
      setImageUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to upload image';
      setError(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setImageUrl('');
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

      {!imageUrl && !uploading && (
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
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPEG, PNG, WEBP, GIF (max 5MB)
          </Typography>
        </Paper>
      )}

      {uploading && (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {imageUrl && !uploading && (
        <Paper sx={{ p: 1, position: 'relative' }}>
          <Box
            component="img"
            src={imageUrl}
            alt="Uploaded"
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
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

export default ImageUpload;
