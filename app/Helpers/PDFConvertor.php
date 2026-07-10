<?php

namespace App\Helpers;

/**
 * PDF Converter Helper
 * File: app/Helpers/pdf_converter_helper.php
 *
 * Converts images to PDF. Returns a consistent response array for all cases:
 *
 *   ['status' => 'success', 'message' => '...', 'path' => '...']
 *
 * Scenarios:
 *  - Image (JPG/PNG/GIF/WEBP)  → Converts to PDF    → status: success
 *  - Already a PDF path/base64 → No conversion needed → status: success
 *  - Empty / null              → Nothing to do        → status: success
 *  - Conversion error          → status: error
 *
 * Requirements:
 *   composer require tecnickcom/tcpdf
 *   Define `PDF_STORAGE_PATH` in app/Config/Constants.php to customize output storage.
 *
 * Usage (CI4):
 *   helper('pdf_converter');
 *   $result = image_to_pdf($base64OrPath, 'invoice');
 *   // $result = ['status' => 'success', 'message' => 'Image converted to PDF.', 'path' => 'uploads/pdfs/invoice_abc_20250421.pdf']
 */


// ═══════════════════════════════════════════════════════════════
//  GUARD: Skip conversion check
// ═══════════════════════════════════════════════════════════════

if (! function_exists('needs_pdf_conversion')) {

    /**
     * Returns TRUE only when the value is a real image that needs converting.
     * Returns FALSE for: empty/null, existing PDF paths, base64 PDF data.
     *
     * @param  mixed $value
     * @return bool
     */
    function needs_pdf_conversion($value)
    {
        // Empty or null → skip
        if (empty($value)) {
            return false;
        }

        // Already a .pdf file path → skip
        if (is_string($value) && strtolower(pathinfo($value, PATHINFO_EXTENSION)) === 'pdf') {
            return false;
        }

        // Base64-encoded PDF bytes ("%PDF-" → "JVBERi0") → skip
    if (is_string($value) && strpos(ltrim($value), 'JVBERi0') === 0) {
            return false;
        }

        // Base64 PDF data URI → skip
        if (is_string($value) && preg_match('/^data:application\/pdf;base64,/i', $value)) {
            return false;
        }

        // Anything else (image base64, image path, image URL) → needs conversion
        return true;
    }
}


// ═══════════════════════════════════════════════════════════════
//  SINGLE IMAGE → PDF
// ═══════════════════════════════════════════════════════════════

if (! function_exists('image_to_pdf')) {

    /**
     * Convert a single image to a one-page A4 PDF.
     *
     * Always returns a consistent response array:
     *   ['status' => 'success'|'error', 'message' => '...', 'path' => '...']
     *
     * Cases:
     *   - Image input    → converts to PDF  → status: success, path: new PDF path
     *   - Already a PDF  → no conversion    → status: success, path: original value
     *   - Empty / null   → nothing to do    → status: success, path: ''
     *   - Error          →                  → status: error,   path: ''
     *
     * @param  mixed  $imageData  Base64 data URI, local file path, remote URL, PDF path, or empty
     * @param  string $prefix     Output filename prefix (default: 'file')
     * @return array{status: string, message: string, path: string}
     */
    function image_to_pdf($imageData, $prefix = 'file')
    {
       
        try {
            // ── Case 1: Empty / null → success, nothing to store ──────────────
            if (empty($imageData)) {
                return [
                    'status'  => 'success',
                    'message' => 'No file provided. Skipped.',
                    'path'    => '',
                ];
            }

            // ── Case 2: Already a PDF → success, use as-is ───────────────────
            if (! needs_pdf_conversion($imageData)) {
                return [
                    'status'  => 'success',
                    'message' => 'File is already a PDF. No conversion needed.',
                    'path'    => $imageData,
                ];
            }

            // ── Case 3: Image → convert to PDF ────────────────────────────────
            [$imageBytes, $extension] = _pdf_decode_image($imageData);
            if (class_exists('TCPDF')) {
                $tmpPath = _pdf_write_temp($imageBytes, $extension);
                $pdf = _pdf_make_instance();
                $pdf->AddPage();
                _pdf_add_image_page($pdf, $tmpPath, $extension);

                @unlink($tmpPath);
                $savedPath = _pdf_save($pdf, $prefix);
            } else {
                $savedPath = _pdf_save_manual($imageBytes, $extension, $prefix);
            }

            return [
                'status'  => 'success',
                'message' => 'Image converted to PDF successfully.',
                'path'    => $savedPath,
            ];

        } catch (\Throwable $e) {
            return [
                'status'  => 'error',
                'message' => 'PDF conversion failed: ' . $e->getMessage(),
                'path'    => '',
            ];
        }
    }
}


// ═══════════════════════════════════════════════════════════════
//  MULTIPLE IMAGES → SINGLE MULTI-PAGE PDF
// ═══════════════════════════════════════════════════════════════

if (! function_exists('images_to_pdf')) {

    /**
     * Merge multiple images into a single multi-page A4 PDF.
     * Each image = one page. Skips empty/null/PDF entries automatically.
     *
     * Always returns a consistent response array:
     *   ['status' => 'success'|'error', 'message' => '...', 'path' => '...']
     *
     * @param  array  $images  Array of base64 strings, file paths, or remote URLs
     * @param  string $prefix  Output filename prefix  (default: 'file')
     * @return array{status: string, message: string, path: string}
     */
    function images_to_pdf(array $images, string $prefix = 'file'): array
    {
        if (! class_exists('TCPDF')) {
            return [
                'status'  => 'error',
                'message' => 'TCPDF is not installed. Install tecnickcom/tcpdf to enable multi-page PDF conversion.',
                'path'    => '',
            ];
        }
        try {
            // ── Case 1: Empty array → success ─────────────────────────────────
            if (empty($images)) {
                return [
                    'status'  => 'success',
                    'message' => 'No images provided. Skipped.',
                    'path'    => '',
                ];
            }

            $pdf      = _pdf_make_instance();
            $tmpFiles = [];
            $added    = 0;

            foreach ($images as $imageData) {
                if (! needs_pdf_conversion($imageData)) {
                    continue; // skip empty / already PDF entries
                }

                [$imageBytes, $extension] = _pdf_decode_image($imageData);
                $tmpPath    = _pdf_write_temp($imageBytes, $extension);
                $tmpFiles[] = $tmpPath;

                $pdf->AddPage();
                _pdf_add_image_page($pdf, $tmpPath, $extension);
                $added++;
            }

            // Cleanup temp files
            foreach ($tmpFiles as $tmp) {
                @unlink($tmp);
            }

            // ── Case 2: All entries were PDF/empty → success ──────────────────
            if ($added === 0) {
                return [
                    'status'  => 'success',
                    'message' => 'All files are already PDFs or empty. No conversion needed.',
                    'path'    => '',
                ];
            }

            // ── Case 3: Images converted ──────────────────────────────────────
            $savedPath = _pdf_save($pdf, $prefix);

            return [
                'status'  => 'success',
                'message' => "{$added} image(s) converted and merged into a single PDF.",
                'path'    => $savedPath,
            ];

        } catch (\Throwable $e) {
            return [
                'status'  => 'error',
                'message' => 'PDF conversion failed: ' . $e->getMessage(),
                'path'    => '',
            ];
        }
    }
}


// ═══════════════════════════════════════════════════════════════
//  HTML STRING → PDF
// ═══════════════════════════════════════════════════════════════

if (! function_exists('html_to_pdf')) {

    /**
     * Convert an HTML string into a PDF file.
     *
     * @param  string $html    Valid HTML content
     * @param  string $prefix  Output filename prefix  (default: 'document')
     * @return string          Relative path of saved PDF
     */
    function html_to_pdf(string $html, string $prefix = 'document'): string
    {
        if (empty(trim($html))) {
            throw new \RuntimeException('HTML content cannot be empty.');
        }

        $pdf = _pdf_make_instance();
        $pdf->SetMargins(10, 10, 10);
        $pdf->SetAutoPageBreak(true, 10);
        $pdf->AddPage();
        $pdf->writeHTML($html, true, false, true, false, '');

        return _pdf_save($pdf, $prefix);
    }
}


// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════

if (! function_exists('pdf_url')) {

    /**
     * Convert a stored relative PDF path to a full public URL.
     *
     * @param  string $relativePath  e.g. uploads/pdfs/invoice_abc.pdf
     * @return string
     */
    function pdf_url(string $relativePath): string
    {
        return base_url($relativePath);
    }
}


if (! function_exists('pdf_delete')) {

    /**
     * Delete a stored PDF by its relative path.
     *
     * @param  string $relativePath  e.g. uploads/pdfs/invoice_abc.pdf
     * @return bool
     */
    function pdf_delete(string $relativePath): bool
    {
        if (is_file($relativePath)) {
            $fullPath = $relativePath;
        } else {
            $fullPath = _pdf_resolve_image_path($relativePath) ?? (WRITEPATH . $relativePath);
        }
        return is_file($fullPath) && unlink($fullPath);
    }
}


// ═══════════════════════════════════════════════════════════════
//  INTERNAL HELPERS  (not part of the public API)
// ═══════════════════════════════════════════════════════════════

if (! function_exists('_pdf_decode_image')) {

    /**
     * @internal  Decode image data into raw bytes + extension.
     * @return array  [string $bytes, string $extension]
     */
    function _pdf_decode_image(string $imageData): array
    {
        // print_r($imageData);exit;
        if (preg_match('/^data:image\/(\w+);base64,/i', $imageData, $m)) {
            // Base64 data URI
            $extension  = strtolower($m[1]);
            $imageBytes = base64_decode(substr($imageData, strpos($imageData, ',') + 1), true);
            if ($imageBytes === false) {
                throw new \RuntimeException('Failed to decode base64 image.');
            }

        } elseif (filter_var($imageData, FILTER_VALIDATE_URL)) {
            // Remote URL
            $imageBytes = @file_get_contents($imageData);
            if ($imageBytes === false) {
                throw new \RuntimeException("Cannot fetch image from URL: {$imageData}");
            }
            $extension = _pdf_detect_extension($imageBytes);

        } elseif (is_file($imageData) || ($resolvedPath = _pdf_resolve_image_path($imageData)) !== null) {
            $filePath = is_file($imageData) ? $imageData : $resolvedPath;
            $imageBytes = file_get_contents($filePath);
            $extension  = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        } elseif (is_string($imageData) && @imagecreatefromstring($imageData) !== false) {
            // Raw image bytes
            $imageBytes = $imageData;
            $extension  = _pdf_detect_extension($imageBytes);
        } else {
            throw new \RuntimeException("Invalid image input — not a base64 URI, URL, local file path, or raw image bytes.");
        }

        // Normalise jpg → jpeg
        $extension = ($extension === 'jpg') ? 'jpeg' : $extension;
        // print_r($extension);exit;
        return [$imageBytes, $extension];
    }
}

if (! function_exists('_pdf_resolve_image_path')) {
    /**
     * @internal Resolve a relative or non-standard image path to an existing file path.
     */
    function _pdf_resolve_image_path(string $imagePath): ?string
    {
        $imagePath = trim($imagePath);
        $imagePath = trim($imagePath, "\"' ");

        if (is_file($imagePath)) {
            return $imagePath;
        }

        $normalized = preg_replace('#^[\.\\/]+#', '', $imagePath);
        $searchPaths = [];

        $normalizedSap = '';
        if (defined('SAP_FILE_PATH')) {
            $normalizedSap = preg_replace('#^[\.\\/]+#', '', SAP_FILE_PATH);
        }

        if (defined('FCPATH')) {
            $searchPaths[] = rtrim(FCPATH, '/\\') . DIRECTORY_SEPARATOR;
        }
        if (defined('ROOTPATH')) {
            $searchPaths[] = rtrim(ROOTPATH, '/\\') . DIRECTORY_SEPARATOR;
        }
        if (defined('WRITEPATH')) {
            $searchPaths[] = rtrim(WRITEPATH, '/\\') . DIRECTORY_SEPARATOR;
        }

        if (defined('SAP_FILE_PATH')) {
            $sapBase = _pdf_resolve_base_dir(SAP_FILE_PATH);
            if ($sapBase !== null) {
                $searchPaths[] = rtrim($sapBase, '/\\') . DIRECTORY_SEPARATOR;
            }
        }

        foreach ($searchPaths as $base) {
            $candidate = $base . $normalized;
            if (is_file($candidate)) {
                return $candidate;
            }
            $real = realpath($candidate);
            if ($real && is_file($real)) {
                return $real;
            }
            if ($normalizedSap !== '' && strpos($normalized, $normalizedSap) === 0) {
                $relative = ltrim(substr($normalized, strlen($normalizedSap)), '/\\');
                $candidate = $base . $relative;
                if (is_file($candidate)) {
                    return $candidate;
                }
                $real = realpath($candidate);
                if ($real && is_file($real)) {
                    return $real;
                }
            }
        }

        $cwdCandidate = realpath(getcwd() . DIRECTORY_SEPARATOR . $imagePath);
        if ($cwdCandidate && is_file($cwdCandidate)) {
            return $cwdCandidate;
        }

        if ($normalizedSap !== '' && ($sapBase = _pdf_resolve_base_dir(SAP_FILE_PATH)) !== null) {
            if (strpos($normalized, $normalizedSap) === 0) {
                $relative = ltrim(substr($normalized, strlen($normalizedSap)), '/\\');
                $candidate = rtrim($sapBase, '/\\') . DIRECTORY_SEPARATOR . $relative;
                if (is_file($candidate)) {
                    return realpath($candidate);
                }
            }
        }

        return null;
    }
}

if (! function_exists('_pdf_resolve_base_dir')) {
    /**
     * @internal Resolve a directory path relative to known app roots.
     */
    function _pdf_resolve_base_dir(string $baseDir): ?string
    {
        $baseDir = trim($baseDir, "\"' ");
        if ($baseDir === '') {
            return null;
        }

        if (is_dir($baseDir)) {
            return realpath($baseDir);
        }

        $candidates = [];
        if (defined('APPPATH')) {
            $candidates[] = rtrim(APPPATH, '/\\') . DIRECTORY_SEPARATOR . ltrim($baseDir, '/\\');
        }
        if (defined('FCPATH')) {
            $candidates[] = rtrim(FCPATH, '/\\') . DIRECTORY_SEPARATOR . ltrim($baseDir, '/\\');
        }
        if (defined('ROOTPATH')) {
            $candidates[] = rtrim(ROOTPATH, '/\\') . DIRECTORY_SEPARATOR . ltrim($baseDir, '/\\');
        }
        if (defined('WRITEPATH')) {
            $candidates[] = rtrim(WRITEPATH, '/\\') . DIRECTORY_SEPARATOR . ltrim($baseDir, '/\\');
        }
        $candidates[] = realpath(getcwd() . DIRECTORY_SEPARATOR . $baseDir);

        foreach ($candidates as $candidate) {
            if ($candidate && is_dir($candidate)) {
                return realpath($candidate);
            }
        }

        return null;
    }
}

if (! function_exists('_pdf_storage_base_dir')) {
    /**
     * @internal Determine the directory where generated PDFs should be stored.
     */
    function _pdf_storage_base_dir(): string
    {
        $base = null;
        if (defined('PDF_STORAGE_PATH')) {
            $base = constant('PDF_STORAGE_PATH');
        } elseif (defined('SAP_FILE_PATH')) {
            $base = constant('SAP_FILE_PATH');
        }

        if ($base !== null) {
            $base = trim($base, "\"' ");
            if (! preg_match('#(?:^|[\\/])pdfs[\\/]*$#i', $base)) {
                $base = rtrim($base, '/\\') . DIRECTORY_SEPARATOR . 'pdfs';
            } else {
                $base = rtrim($base, '/\\');
            }
            $resolved = _pdf_resolve_base_dir($base);
            if ($resolved !== null) {
                return rtrim($resolved, '/\\');
            }
            $parent = dirname($base);
            $resolvedParent = _pdf_resolve_base_dir($parent);
            if ($resolvedParent !== null) {
                return rtrim($resolvedParent, '/\\') . DIRECTORY_SEPARATOR . basename($base);
            }
            return $base;
        }

        return rtrim(WRITEPATH, '/\\') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'pdfs';
    }
}

if (! function_exists('_pdf_storage_return_path')) {
    /**
     * @internal  Convert a saved filename into the returned storage path.
     */
    function _pdf_storage_return_path(string $filename): string
    {
        $base = null;
        if (defined('PDF_STORAGE_PATH')) {
            $base = constant('PDF_STORAGE_PATH');
        } elseif (defined('SAP_FILE_PATH')) {
            $base = constant('SAP_FILE_PATH');
        }

        if ($base !== null) {
            $base = trim($base, "\"' ");
            if (! preg_match('#(?:^|[\\/])pdfs[\\/]*$#i', $base)) {
                $base = rtrim($base, '/\\') . '/pdfs';
            } else {
                $base = rtrim($base, '/\\');
            }
            return $base . '/' . $filename;
        }

        return 'uploads/pdfs/' . $filename;
    }
}


if (! function_exists('_pdf_detect_extension')) {

    /**
     * @internal  Detect image type from magic bytes.
     */
    function _pdf_detect_extension($bytes)
    {
        $hex = bin2hex(substr($bytes, 0, 4));
        if (strpos($hex, 'ffd8ff') === 0) {
            return 'jpeg';
        }
        if (strpos($hex, '89504e47') === 0) {
            return 'png';
        }
        if (strpos($hex, '47494638') === 0) {
            return 'gif';
        }
        if (strpos($hex, '52494646') === 0) {
            return 'webp';
        }
        return 'jpeg';
    }
}


if (! function_exists('_pdf_write_temp')) {

    /**
     * @internal  Write raw bytes to a temp file and return its path.
     */
    function _pdf_write_temp(string $bytes, string $extension): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'pdf_conv_') . '.' . $extension;
        if (file_put_contents($tmp, $bytes) === false) {
            throw new \RuntimeException('Failed to write temp image file.');
        }
        return $tmp;
    }
}


if (! function_exists('_pdf_make_instance')) {

    /**
     * @internal  Create and configure a base TCPDF instance.
     */
    function _pdf_make_instance()
    {
        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('CI4 App');
        $pdf->SetAuthor('System');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false, 0);
        return $pdf;
    }
}


if (! function_exists('_pdf_add_image_page')) {

    /**
     * @internal  Draw an image filling the full current TCPDF page.
     */
    function _pdf_add_image_page($pdf, $tmpPath, $extension)
    {
        $tcpdfType = strtoupper($extension === 'jpeg' ? 'JPG' : $extension);
        $pdf->Image(
            $tmpPath,
            0, 0,
            $pdf->getPageWidth(),
            $pdf->getPageHeight(),
            $tcpdfType
        );
    }
}


if (! function_exists('_pdf_save')) {

    /**
     * @internal  Save TCPDF output to disk and return the relative path.
     */
    function _pdf_save($pdf, $prefix)
    {
        $outputDir = _pdf_storage_base_dir() . DIRECTORY_SEPARATOR;
        if (! is_dir($outputDir) && ! mkdir($outputDir, 0755, true)) {
            throw new \RuntimeException("Cannot create PDF output directory: {$outputDir}");
        }

        $filename = $prefix . '_' . uniqid() . '_' . date('Ymd') . '.pdf';
        $pdf->Output($outputDir . $filename, 'F');
        return _pdf_storage_return_path($filename);
    }
}

if (! function_exists('_pdf_save_manual')) {

    /**
     * @internal  Save raw image bytes as a simple single-page PDF.
     */
    function _pdf_save_manual(string $imageBytes, string $extension, string $prefix): string
    {
        if (! extension_loaded('gd')) {
            throw new \RuntimeException('GD extension is required for manual PDF conversion.');
        }

        $image = imagecreatefromstring($imageBytes);
        if ($image === false) {
            throw new \RuntimeException('Unable to decode image for manual PDF conversion.');
        }

        ob_start();
        imagejpeg($image, null, 90);
        $jpegBytes = ob_get_clean();
        imagedestroy($image);

        if ($jpegBytes === false || $jpegBytes === '') {
            throw new \RuntimeException('Failed to encode image as JPEG for manual PDF conversion.');
        }

        $outputDir = _pdf_storage_base_dir() . DIRECTORY_SEPARATOR;
        if (! is_dir($outputDir) && ! mkdir($outputDir, 0755, true)) {
            throw new \RuntimeException("Cannot create PDF output directory: {$outputDir}");
        }

        $filename = $prefix . '_' . uniqid() . '_' . date('Ymd') . '.pdf';
        $pdfPath = $outputDir . $filename;
        $pdfContent = _pdf_build_single_image_pdf($jpegBytes);
        if (file_put_contents($pdfPath, $pdfContent) === false) {
            throw new \RuntimeException('Failed to write PDF file to disk.');
        }

        return _pdf_storage_return_path($filename);
    }
}

if (! function_exists('_pdf_build_single_image_pdf')) {

    /**
     * @internal  Build a simple PDF file content for one JPEG image.
     */
    function _pdf_build_single_image_pdf(string $jpegBytes): string
    {
        $imageInfo = getimagesizefromstring($jpegBytes);
        if ($imageInfo === false) {
            throw new \RuntimeException('Unable to read JPEG image dimensions.');
        }

        [$width, $height] = $imageInfo;
        $imageLength = strlen($jpegBytes);
        $contents = "q {$width} 0 0 {$height} 0 0 cm /Im0 Do Q";

        $obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$width} {$height}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n";
        $obj4 = "4 0 obj\n<< /Type /XObject /Subtype /Image /Name /Im0 /Width {$width} /Height {$height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {$imageLength} >>\nstream\n{$jpegBytes}\nendstream\nendobj\n";
        $obj5 = "5 0 obj\n<< /Length " . strlen($contents) . " >>\nstream\n{$contents}\nendstream\nendobj\n";

        $objects = [$obj1, $obj2, $obj3, $obj4, $obj5];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $obj) {
            $offsets[] = strlen($pdf);
            $pdf .= $obj;
        }

        $xref = "xref\n0 " . (count($objects) + 1) . "\n";
        $xref .= sprintf("%010d 65535 f \n", 0);
        foreach (array_slice($offsets, 1) as $offset) {
            $xref .= sprintf("%010d 00000 n \n", $offset);
        }

        $pdf .= $xref;
        $pdf .= "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\n";
        $pdf .= "startxref\n" . strlen($pdf) . "\n%%EOF\n";

        return $pdf;
    }
}

    if (! class_exists('App\\Helpers\\PDFConvertor')) {
        class PDFConvertor
        {
            public static function image_to_pdf($imageData, $prefix = 'file')
            {
                return image_to_pdf($imageData, $prefix);
            }

            public static function images_to_pdf(array $images, $prefix = 'file')
            {
                return images_to_pdf($images, $prefix);
            }

            public static function html_to_pdf($html, $prefix = 'document')
            {
                return html_to_pdf($html, $prefix);
            }
        }
    }
