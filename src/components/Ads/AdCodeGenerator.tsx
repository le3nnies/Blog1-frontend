import { useState, useEffect } from "react";
import { GoogleAdConfig } from "@/types/ads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Code, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdCodeGeneratorProps {
  config: GoogleAdConfig;
}

const AdCodeGenerator = ({ config }: AdCodeGeneratorProps) => {
  const { toast } = useToast();
  const [codeFormat, setCodeFormat] = useState<"async" | "sync">("async");
  const [generatedCode, setGeneratedCode] = useState("");

  // Generate AdSense code based on configuration
  const generateAdCode = () => {
    const adSlot = config.adSlot;
    const adFormat = getAdFormat();
    const fullWidthResponsive = config.responsive ? "true" : "false";

    let styleString = "";
    if (config.size && config.size !== "auto") {
      const dimensions = getAdDimensions();
      if (dimensions) {
        styleString = `style="display:inline-block;width:${dimensions.width}px;height:${dimensions.height}px"`;
      }
    }

    if (config.maxWidth) {
      styleString = styleString ? styleString.replace('style="', `style="max-width:${config.maxWidth};`) : `style="max-width:${config.maxWidth}"`;
    }

    let customStyleString = "";
    if (config.customStyle) {
      customStyleString = config.customStyle;
    }

    if (codeFormat === "async") {
      // Async AdSense code
      return `<ins class="adsbygoogle"
     style="display:block${styleString ? ';' + styleString.replace('style="', '').replace('"', '') : ''}"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="${adSlot}"
     data-ad-format="${adFormat}"
     data-full-width-responsive="${fullWidthResponsive}"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>${customStyleString ? `\n<style>\n${customStyleString}\n</style>` : ''}`;
    } else {
      // Sync AdSense code (legacy)
      return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:inline-block;width:${getAdDimensions()?.width || 728}px;height:${getAdDimensions()?.height || 90}px${styleString ? ';' + styleString.replace('style="', '').replace('"', '') : ''}"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="${adSlot}"
     data-ad-format="${adFormat}"
     data-full-width-responsive="${fullWidthResponsive}"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>${customStyleString ? `\n<style>\n${customStyleString}\n</style>` : ''}`;
    }
  };

  // Get ad format string for AdSense
  const getAdFormat = () => {
    const size = config.size || "auto";
    const format = config.format || "auto";

    if (size === "auto") {
      return "auto";
    }

    switch (size) {
      case "rectangle":
        return "rectangle";
      case "vertical":
        return "vertical";
      case "banner":
      case "leaderboard":
        return "horizontal";
      case "mobile_banner":
        return "horizontal";
      case "skyscraper":
        return "vertical";
      case "square":
        return "rectangle";
      default:
        return "auto";
    }
  };

  // Get ad dimensions for specific sizes
  const getAdDimensions = () => {
    const size = config.size || "auto";

    switch (size) {
      case "rectangle":
        return { width: 300, height: 250 };
      case "vertical":
        return { width: 300, height: 600 };
      case "banner":
        return { width: 728, height: 90 };
      case "leaderboard":
        return { width: 728, height: 90 };
      case "mobile_banner":
        return { width: 320, height: 50 };
      case "skyscraper":
        return { width: 120, height: 600 };
      case "square":
        return { width: 250, height: 250 };
      default:
        return null;
    }
  };

  // Generate implementation code for different frameworks
  const generateImplementationCode = (framework: string) => {
    const adCode = generateAdCode();

    switch (framework) {
      case "react":
        return `import { useEffect } from 'react';

const ${config.adUnit.replace(/\s+/g, '')}Ad = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div dangerouslySetInnerHTML={{
      __html: \`${adCode.replace(/`/g, '\\`')}\`
    }} />
  );
};

export default ${config.adUnit.replace(/\s+/g, '')}Ad;`;

      case "vue":
        return `<template>
  <div v-html="adCode"></div>
</template>

<script>
export default {
  name: '${config.adUnit.replace(/\s+/g, '')}Ad',
  data() {
    return {
      adCode: \`${adCode.replace(/`/g, '\\`')}\`
    };
  },
  mounted() {
    this.$nextTick(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    });
  }
};
</script>`;

      case "angular":
        return `import { Component, OnInit } from '@angular/core';

@Component({
  selector: '${config.adUnit.toLowerCase().replace(/\s+/g, '-')}-ad',
  template: \`<div [innerHTML]="adCode"></div>\`,
  styles: [\`${config.customStyle || ''}\`]
})
export class ${config.adUnit.replace(/\s+/g, '')}AdComponent implements OnInit {
  adCode = \`${adCode.replace(/`/g, '\\`')}\`;

  ngOnInit() {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      ((window as any).adsbygoogle).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }
}`;

      case "html":
      default:
        return adCode;
    }
  };

  // Update generated code when config or format changes
  useEffect(() => {
    setGeneratedCode(generateAdCode());
  }, [config, codeFormat]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied to clipboard",
        description: "Ad code has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.adUnit.replace(/\s+/g, '_').toLowerCase()}_adsense_code.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code downloaded",
      description: "Ad code has been downloaded as a text file",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Ad Code Generator: {config.adUnit}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={codeFormat} onValueChange={(value: any) => setCodeFormat(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="async">Async</SelectItem>
                <SelectItem value="sync">Sync</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="vue">Vue</TabsTrigger>
            <TabsTrigger value="angular">Angular</TabsTrigger>
          </TabsList>

          {["html", "react", "vue", "angular"].map((framework) => (
            <TabsContent key={framework} value={framework} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {framework}
                    </Badge>
                    <Badge variant="secondary">
                      {codeFormat === "async" ? "Async Loading" : "Sync Loading"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    value={framework === "html" ? generatedCode : generateImplementationCode(framework)}
                    readOnly
                    className="font-mono text-sm min-h-[300px] resize-none"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  />
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Important:</strong> Replace <code>ca-pub-XXXXXXXXXXXXXXXX</code> with your actual AdSense publisher ID.</p>
                  {framework === "html" && (
                    <p>Make sure the AdSense script is loaded once per page, typically in the{'<head>'}section.</p>
                  )}
                  {config.customStyle && (
                    <p>Custom styles have been included in the generated code.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdCodeGenerator;
