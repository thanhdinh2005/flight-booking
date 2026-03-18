<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\ExportSummaryReportUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportPdf(Request $request, ExportSummaryReportUseCase $useCase)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $pdf = $useCase->execute($request->start_date, $request->end_date);

        $fileName = 'Bao_Cao_Doanh_Thu_' . time() . '.pdf';

        return $pdf->download($fileName);
    }
}