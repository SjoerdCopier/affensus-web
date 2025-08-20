import { NextRequest } from 'next/server'

export async function onRequestGet(context: { request: Request; env: any; params: { courseId: string } }) {
  try {
    const { request, env, params } = context
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const db = env.DB
    
    // Get or create progress record for this user and course
    let progress = await db.prepare(`
      SELECT * FROM user_course_progress 
      WHERE user_id = ? AND course_id = ?
    `).bind(userId, params.courseId).first()

    if (!progress) {
      // Create initial progress record
      const result = await db.prepare(`
        INSERT INTO user_course_progress (user_id, course_id, current_lesson_id, current_section_id, completed_lessons)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, params.courseId, null, null, '[]').run()
      
      progress = {
        user_id: userId,
        course_id: params.courseId,
        current_lesson_id: null,
        current_section_id: null,
        completed_lessons: '[]',
        last_accessed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Parse completed lessons JSON
    const completedLessons = JSON.parse(progress.completed_lessons || '[]')

    return new Response(JSON.stringify({
      success: true,
      data: {
        currentLessonId: progress.current_lesson_id,
        currentSectionId: progress.current_section_id,
        completedLessons,
        lastAccessedAt: progress.last_accessed_at
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error fetching user progress:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch user progress' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function onRequestPost(context: { request: Request; env: any; params: { courseId: string } }) {
  try {
    const { request, env, params } = context
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { lessonId, sectionId, action } = body

    if (!lessonId || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lesson ID and action are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const db = env.DB
    
    // Get current progress
    let progress = await db.prepare(`
      SELECT * FROM user_course_progress 
      WHERE user_id = ? AND course_id = ?
    `).bind(userId, params.courseId).first()

    if (!progress) {
      // Create initial progress record
      await db.prepare(`
        INSERT INTO user_course_progress (user_id, course_id, current_lesson_id, current_section_id, completed_lessons)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, params.courseId, lessonId, sectionId || null, '[]').run()
      
      progress = {
        user_id: userId,
        course_id: params.courseId,
        current_lesson_id: lessonId,
        current_section_id: sectionId || null,
        completed_lessons: '[]',
        last_accessed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Parse current completed lessons
    const completedLessons = JSON.parse(progress.completed_lessons || '[]')
    let updatedCompletedLessons = [...completedLessons]
    let updatedCurrentLessonId = progress.current_lesson_id
    let updatedCurrentSectionId = progress.current_section_id

    // Handle different actions
    switch (action) {
      case 'start':
        // User started a lesson
        updatedCurrentLessonId = lessonId
        updatedCurrentSectionId = sectionId || null
        break
        
      case 'complete':
        // User completed a lesson
        if (!completedLessons.includes(lessonId)) {
          updatedCompletedLessons.push(lessonId)
        }
        updatedCurrentLessonId = lessonId
        updatedCurrentSectionId = sectionId || null
        break
        
      case 'update_section':
        // User updated section within a lesson
        updatedCurrentLessonId = lessonId
        updatedCurrentSectionId = sectionId || null
        break
        
      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }

    // Update progress in database
    await db.prepare(`
      UPDATE user_course_progress 
      SET current_lesson_id = ?, 
          current_section_id = ?, 
          completed_lessons = ?, 
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `).bind(
      updatedCurrentLessonId,
      updatedCurrentSectionId,
      JSON.stringify(updatedCompletedLessons),
      userId,
      params.courseId
    ).run()

    return new Response(JSON.stringify({
      success: true,
      data: {
        currentLessonId: updatedCurrentLessonId,
        currentSectionId: updatedCurrentSectionId,
        completedLessons: updatedCompletedLessons,
        lastAccessedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error updating user progress:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update user progress' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 