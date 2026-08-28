import { ImageResponse } from 'next/og';
import {
  SiNextdotjs,
  SiTypescript,
  SiMongodb,
  SiPrisma,
  SiReact,
  SiTailwindcss,
  SiOpenai,
} from 'react-icons/si';

export const runtime = 'edge';

const websiteUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'https://demo.saashq.org';

export async function GET(request: Request) {
  try {
    const interExtrabold = fetch(
      new URL('../../../public/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const { searchParams } = new URL(request.url);

    const title =
      searchParams.get('title')?.slice(0, 200) || 'SaasHQ';

    const description =
      searchParams.get('description')?.slice(0, 200) ||
      'SaasHQ is an open source CRM/ERP starter built on top of NextJS. Technology stack: NextJS with Typescript, Postgresql, TailwindCSS, React, Prisma, shadCN, resend.com, react.email and more.';

    return new ImageResponse(
      (
        <div tw="flex flex-row-reverse h-full bg-neutral-800">
          <div tw="flex w-1/2 h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              tw="w-full h-full"
              src={`${websiteUrl}/img/hero.png`}
              width="50%"
              height="50%"
              alt="SaasHQ"
            />

            <div
              tw="absolute left-[-80px] top-[-30px] w-[150px] h-[120%] bg-neutral-800"
              style={{
                transform: 'rotate(12deg)',
              }}
            />
          </div>

          <div tw="flex flex-col w-1/2 p-[48px] mt-auto text-white">
            <h1 tw="text-[52px]">{title}</h1>

            <p tw="text-[26px] text-neutral-400">
              {description}
            </p>

            <div tw="flex py-5">
              <SiNextdotjs size={50} color="white" />
              <SiTypescript size={50} color="#3178C6" />
              <SiMongodb size={50} color="#47A248" />
              <SiPrisma size={50} color="#ffffff" />
              <SiReact size={50} color="#61DAFB" />
              <SiTailwindcss size={50} color="#06B6D4" />
              <SiOpenai size={50} color="white" />
            </div>

            <p tw="text-neutral-300 pb-10">
              https://demo.saashq.org
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: await interExtrabold,
            style: 'normal',
            weight: 800,
          },
        ],
      }
    );
  } catch (error) {
    console.error('OG image generation error:', error);

    return new Response('Failed to generate OG image', {
      status: 500,
    });
  }
}