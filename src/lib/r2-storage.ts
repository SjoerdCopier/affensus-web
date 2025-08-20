import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'morsexpress-course-content'

// Validate R2 configuration
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2 configuration:', {
    accountId: !!R2_ACCOUNT_ID,
    accessKeyId: !!R2_ACCESS_KEY_ID,
    secretAccessKey: !!R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME
  })
  throw new Error('Missing required R2 configuration. Please check your environment variables.')
}

// Initialize R2 client (compatible with S3 SDK)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export interface VideoAccessOptions {
  userId?: string
  courseId: string
  lessonId: string
  expiresIn?: number // seconds, default 3600 (1 hour)
  userAgent?: string
  ipAddress?: string
}

/**
 * Generate a signed URL for protected video content
 */
export async function generateVideoSignedUrl(
  videoPath: string,
  options: VideoAccessOptions
): Promise<string> {
  const { expiresIn = 3600 } = options
  
  try {
    console.log('Generating signed URL for:', {
      videoPath,
      bucket: R2_BUCKET_NAME,
      expiresIn
    })

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: videoPath,
      // Add metadata for tracking
      ResponseContentDisposition: 'inline',
      ResponseContentType: 'video/mp4',
    })

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn,
    })

    console.log('Successfully generated signed URL for:', videoPath)

    // Log access attempt for analytics/security
    await logVideoAccess({
      videoPath,
      signedUrl,
      ...options,
      timestamp: new Date().toISOString(),
    })

    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL for', videoPath, ':', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('NoSuchKey')) {
        throw new Error(`Video file not found: ${videoPath}`)
      } else if (error.message.includes('AccessDenied')) {
        throw new Error('Access denied to R2 bucket. Check credentials and permissions.')
      } else if (error.message.includes('InvalidAccessKeyId')) {
        throw new Error('Invalid R2 access key. Check your credentials.')
      } else {
        throw new Error(`Failed to generate video access URL: ${error.message}`)
      }
    }
    
    throw new Error('Failed to generate video access URL')
  }
}

/**
 * Check if user has access to specific course content
 */
export async function verifyVideoAccess(options: VideoAccessOptions): Promise<boolean> {
  const { userId, courseId, lessonId } = options
  
  // TODO: Implement your authentication/authorization logic here
  // For now, we'll do basic checks
  
  // Check if user is authenticated
  if (!userId) {
    return false
  }
  
  // Check if user has access to the course
  // This could check:
  // - User subscription status
  // - Course enrollment
  // - Payment verification
  // - Progress requirements
  
  try {
    // Example: Check user enrollment in database
    const hasAccess = await checkUserCourseAccess(userId, courseId, lessonId)
    return hasAccess
  } catch (error) {
    console.error('Error verifying video access:', error)
    return false
  }
}

/**
 * Check user's course access (implement based on your auth system)
 */
async function checkUserCourseAccess(
  userId: string, 
  courseId: string, 
  lessonId: string
): Promise<boolean> {
  // TODO: Implement your actual authorization logic
  // This might check:
  // - Database for user enrollment
  // - JWT token claims
  // - Subscription status
  // - Course prerequisites
  
  console.log(`Checking access for user ${userId} to ${courseId}/${lessonId}`)
  
  // For demo purposes, return true
  // In production, implement proper authorization
  return true
}

/**
 * Log video access for analytics and security monitoring
 */
async function logVideoAccess(accessData: {
  videoPath: string
  signedUrl: string
  userId?: string
  courseId: string
  lessonId: string
  userAgent?: string
  ipAddress?: string
  timestamp: string
}): Promise<void> {
  try {
    // TODO: Implement logging to your analytics system
    // This could send to:
    // - Cloudflare Analytics
    // - Your database
    // - External analytics service
    
    console.log('Video access logged:', {
      path: accessData.videoPath,
      user: accessData.userId,
      course: accessData.courseId,
      lesson: accessData.lessonId,
      timestamp: accessData.timestamp,
    })
    
    // Example: Store in database or send to analytics
    // await database.videoAccess.create({ data: accessData })
  } catch (error) {
    console.error('Error logging video access:', error)
    // Don't throw - logging failures shouldn't break video access
  }
}

/**
 * Get video metadata without exposing the actual URL
 */
export function getVideoMetadata() {
  return {
    duration: null, // TODO: Extract from video file or store in database
    resolution: null, // TODO: Extract from video file or store in database
    size: null, // TODO: Get file size
    format: 'mp4',
    protected: true,
    requiresAuth: true,
  }
}

/**
 * Validate video path format for security
 */
export function validateVideoPath(path: string): boolean {
  // Ensure path follows expected format and doesn't contain malicious content
  // Updated to support locale structure: courses/{courseId}/{locale}/{lessonId}/videos/{filename}
  const validPathRegex = /^courses\/[a-zA-Z0-9-_]+\/[a-zA-Z-]+\/[a-zA-Z0-9-_]+\/videos\/[a-zA-Z0-9-_.]+\.mp4$/
  return validPathRegex.test(path)
}

/**
 * Build R2 video path from course/lesson information with locale support
 */
export function buildVideoPath(courseId: string, lessonId: string, filename: string, locale: string = 'en'): string {
  // Standardized path structure: courses/{courseId}/{locale}/{lessonId}/videos/{filename}
  return `courses/${courseId}/${locale}/${lessonId}/videos/${filename}`
}

/**
 * Configuration for different video quality levels
 */
export const VIDEO_QUALITIES = {
  '480p': { width: 854, height: 480, bitrate: '1000k' },
  '720p': { width: 1280, height: 720, bitrate: '2500k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
} as const

export type VideoQuality = keyof typeof VIDEO_QUALITIES 