import { authOptions } from '@/lib/auth';
import { s3Client } from '@/lib/digital-ocean-s3';
import { prismadb } from '@/lib/prisma';
import { fillXmlTemplate } from '@/lib/xml-generator';
import { PutObjectAclCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { invoiceId } = params;

  if (!invoiceId) {
    return NextResponse.json(
      {
        error: 'There is no invoice ID, invoice ID is mandatory',
      },
      { status: 400 }
    );
  }

  // Get data for invoice headers
  const myCompany = await prismadb.myAccount.findFirst({});

  // Get data for invoice body
  const invoiceData = await prismadb.invoices.findFirst({
    where: {
      id: invoiceId,
    },
  });

  if (!invoiceData) {
    return NextResponse.json(
      {
        error: 'Invoice not found',
      },
      { status: 404 }
    );
  }

  // Generate XML file from template and data
  const xmlString = fillXmlTemplate(invoiceData, myCompany);

  // Store raw XML string in buffer
  const buffer = Buffer.from(xmlString);

  // Upload XML to S3 bucket
  const bucketParamsJSON = {
    Bucket: process.env.DO_BUCKET,
    Key: `xml/invoice-${invoiceId}.xml`,
    Body: buffer,
    ContentType: 'application/xml',
    ContentDisposition: 'inline',
  };

  await s3Client.send(
    new PutObjectAclCommand(bucketParamsJSON)
  );

  // S3 bucket URL for the invoice
  const urlMoneyS3 =
    `https://${process.env.DO_BUCKET}.` +
    `${process.env.DO_REGION}.digitaloceanspaces.com/` +
    `xml/invoice-${invoiceId}.xml`;

  // Write URL to database
  await prismadb.invoices.update({
    where: {
      id: invoiceId,
    },
    data: {
      money_s3_url: urlMoneyS3,
    },
  });

  return NextResponse.json(
    {
      xmlString,
      invoiceData,
    },
    { status: 200 }
  );
}