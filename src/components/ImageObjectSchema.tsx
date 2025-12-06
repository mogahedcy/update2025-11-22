import React from 'react';
import StructuredDataScript from './StructuredDataScript';

interface ImageObjectSchemaProps {
  contentUrl: string;
  description: string;
  name: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  encodingFormat?: string;
}

export default function ImageObjectSchema({
  contentUrl,
  description,
  name,
  width = 1920,
  height = 1080,
  thumbnailUrl,
  encodingFormat = 'image/webp'
}: ImageObjectSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": contentUrl,
    "description": description,
    "name": name,
    "encodingFormat": encodingFormat,
    "width": width.toString(),
    "height": height.toString(),
    ...(thumbnailUrl && {
      "thumbnail": {
        "@type": "ImageObject",
        "contentUrl": thumbnailUrl,
        "width": "400",
        "height": "300"
      }
    }),
    "creator": {
      "@type": "Organization",
      "name": "محترفين الديار العالمية"
    },
    "copyrightHolder": {
      "@type": "Organization",
      "name": "محترفين الديار العالمية"
    },
    "creditText": "محترفين الديار العالمية - جدة",
    "acquireLicensePage": "https://www.aldeyarksa.tech/contact",
    "license": "https://www.aldeyarksa.tech/terms",
    "inLanguage": "ar"
  };

  return <StructuredDataScript data={schema} />;
}
