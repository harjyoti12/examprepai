import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { escapeRegex } from '@/lib/actions/get-all-notes'
import NoteModel from '@/models/note.model'
import { checkRateLimit, RATE_LIMITS } from '@/lib/business/rate-limit'

export const runtime = 'nodejs'

type SearchNote = {
  _id: unknown
  title?: string
  subject?: string
  fileType?: string
  createdAt?: Date
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateCheck = checkRateLimit(`search:${userId}`, RATE_LIMITS.SEARCH)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again in a moment.' },
        { status: 429 },
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim() || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    await connectToDatabase()

    const searchRegex = { $regex: escapeRegex(query), $options: 'i' }

    const results = await NoteModel.find(
      {
        userId,
        processingStatus: { $ne: "failed" },
        $or: [
          { title: searchRegex },
          { subject: searchRegex },
        ],
      },
      {
        _id: 1,
        title: 1,
        subject: 1,
        fileType: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<SearchNote[]>()

    const formattedResults = results.map((note) => ({
      id: String(note._id),
      title: note.title,
      subject: note.subject,
      fileType: note.fileType,
      createdAt: note.createdAt?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
