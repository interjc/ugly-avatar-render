import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { range } from "lodash-es";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const api = `/api/face`;

export default function Home() {
  const [demoList, setDemoList] = useState<string[]>([]);

  const onSwitch = () => {
    setDemoList(() => range(0, 10).map(() => `${api}?id=${nanoid()}`));
  };

  useEffect(() => {
    onSwitch();
  }, []);

  const convertSVGToPNG = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    const svgText = await response.text();

    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new window.Image() as HTMLImageElement;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob conversion failed."));
            }
          }, "image/png");
          URL.revokeObjectURL(svgUrl);
        } else {
          reject(new Error("Failed to get canvas context."));
        }
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = svgUrl;
    });
  };

  const onDownloadSVG = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.svg";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onDownloadPNG = async (url: string) => {
    try {
      const pngBlob = await convertSVGToPNG(url);
      const pngUrl = URL.createObjectURL(pngBlob);

      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "image.png";
      a.click();
      window.URL.revokeObjectURL(pngUrl);
    } catch (error) {
      console.error("Error downloading PNG:", error);
    }
  };

  const loaderProp = ({ src }: { src: string }) => {
    return src;
  };

  return (
    <div className={`flex min-h-screen flex-col p-12`}>
      <h1 className={"text-center text-lg"}>潦草头像</h1>
      <div className={`flex h-100 w-full p-24 flex-wrap gap-6`}>
        {demoList.map((item) => (
          <Card className="min-w-[220px] max-w-[250px] flex-1" key={item}>
            <CardContent className={"p-5"}>
              <Image
                src={item}
                alt={"index"}
                width={200}
                height={200}
                loader={loaderProp}
              />
            </CardContent>
            <CardFooter className={"flex justify-center items-center"}>
              <Button
                size="sm"
                variant="outline"
                className={"mr-2"}
                onClick={() => onDownloadSVG(item)}
              >
                {" "}
                SVG{" "}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadPNG(item)}
              >
                {" "}
                PNG{" "}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Button onClick={onSwitch}> 换一波 </Button>
    </div>
  );
}
