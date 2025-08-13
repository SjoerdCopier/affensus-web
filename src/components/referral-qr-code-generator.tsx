"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Breadcrumbs from "@/components/breadcrumbs";

const QRCode = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });

interface QROptions {
  size: number;
  fgColor: string;
  bgColor: string;
  includeMargin: boolean;
  imageSettings: {
    src: string;
    excavate: boolean;
    width: number;
    height: number;
  };
}

export default function ReferralQRCodeGenerator() {
  const [url, setUrl] = useState("");
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [qrOptions, setQROptions] = useState<QROptions>({
    size: 256,
    fgColor: "#000000",
    bgColor: "#ffffff",
    includeMargin: false,
    imageSettings: {
      src: "",
      excavate: true,
      width: 24,
      height: 24
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQRCode(url);
  };

  const handleOptionChange = (option: keyof QROptions, value: string | number | boolean) => {
    setQROptions(prev => ({ ...prev, [option]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const scale = size / Math.max(img.width, img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          const squareImage = canvas.toDataURL(file.type);
          setQROptions(prev => ({
            ...prev,
            imageSettings: {
              ...prev.imageSettings,
              src: squareImage
            }
          }));
        };
        const result = e.target?.result;
        if (result && typeof result === 'string') {
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSizeChange = (size: number) => {
    setQROptions(prev => ({
      ...prev,
      imageSettings: {
        ...prev.imageSettings,
        width: size,
        height: size
      }
    }));
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-16 space-y-12">
        {/* Breadcrumbs */}
        <div>
          <Breadcrumbs
            items={[
              {
                label: "Tools",
                href: "/tools",
              },
              {
                label: "Referral QR Code Generator",
                href: "/tools/referral-qr-code-generator",
                current: true,
              },
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Generate Your Referral QR Code for Free!
            </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Create a custom QR code for your referral link. Customize colors, size, and add a logo to make it stand out! We even let you download it for free! Or login and use our API to generate QR codes programmatically.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="referral-url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Referral URL:
            </label>
            <input
              type="url"
              id="referral-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com/ref=yourcode"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-[#6ca979] text-white px-6 py-2 rounded-md hover:bg-[#5a8a66] transition-colors"
          >
            Generate QR Code
          </button>
        </form>

        {qrCode && (
          <div className="mt-8">
            <div className="flex justify-center mb-4">
              <QRCode
                id="qr-code"
                value={qrCode}
                size={qrOptions.size}
                fgColor={qrOptions.fgColor}
                bgColor={qrOptions.bgColor}
                includeMargin={qrOptions.includeMargin}
                imageSettings={qrOptions.imageSettings.src ? qrOptions.imageSettings : undefined}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  value={qrOptions.size}
                  onChange={(e) => handleOptionChange('size', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{qrOptions.size}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color:</label>
                <input
                  type="color"
                  value={qrOptions.fgColor}
                  onChange={(e) => handleOptionChange('fgColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color:</label>
                <input
                  type="color"
                  value={qrOptions.bgColor}
                  onChange={(e) => handleOptionChange('bgColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Include Margin:</label>
                <input
                  type="checkbox"
                  checked={qrOptions.includeMargin}
                  onChange={(e) => handleOptionChange('includeMargin', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Size:</label>
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={qrOptions.imageSettings.width}
                  onChange={(e) => handleLogoSizeChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{qrOptions.imageSettings.width}px</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={downloadQRCode}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download QR Code
            </button>

            <p className="mt-4 text-sm text-gray-600">
              Need to generate QR codes programmatically? Every Affensus package includes a free API to generate QR codes on the fly!
            </p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About this tool</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">What is the Referral QR Code Generator?</h3>
              <p className="text-gray-700">
                Our Referral QR Code Generator is a powerful tool designed to help you create custom QR codes for your referral links. With this tool, you can easily generate QR codes that are both functional and visually appealing, making it easier for your audience to access your referral links.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How does the QR Code Generator work?</h2>
          <p className="text-gray-700 leading-relaxed">
            Simply input your referral URL, and our tool will generate a QR code instantly. You can then customize various aspects of the QR code, including its size, colors, and even add a logo or image to make it more branded and recognizable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why use QR codes for referrals?</h2>
          <p className="text-gray-700 leading-relaxed">
            QR codes provide a quick and easy way for people to access your referral links, especially in physical or offline contexts. They can be added to business cards, flyers, posters, or any other marketing material, bridging the gap between offline and online marketing efforts.
          </p>
        </section>
        </div>
      </div>
      </main>
    </div>
  );
}
