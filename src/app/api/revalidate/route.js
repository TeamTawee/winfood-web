import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { tag } = await request.json();
    if (tag) {
      revalidateTag(tag); // สั่งล้างแคชตามชื่อ Tag ที่ส่งมา
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }
    return NextResponse.json({ message: 'Missing tag' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}