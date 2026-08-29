import { NextResponse } from 'next/server';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// Ép kiểu route thành dynamic để không bị prerender lúc build
export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Kiểm tra an toàn biến môi trường trước khi thực thi
  if (!process.env.DO_ENDPOINT) {
    return NextResponse.json(
      { error: 'DO_ENDPOINT environment variable missing' },
      { status: 500 }
    );
  }

  try {
    // 2. Kiểm tra phiên đăng nhập
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    // 3. Import s3Client động tại đây để tránh lỗi nổ build khi thiếu biến môi trường
    const { s3Client } = await import('@/lib/digital-ocean-s3');

    // 4. Gọi API S3
    const buckets = await s3Client.send(new ListBucketsCommand({}));
    console.log(buckets, 's3 buckets');

    return NextResponse.json({ buckets, success: true }, { status: 200 });
  } catch (error: any) {
    console.error('List buckets error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
