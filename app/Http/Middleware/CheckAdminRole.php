<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Batasi akses endpoint khusus kepada pengguna dengan role admin.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Fitur ini hanya tersedia untuk Admin.',
            ], 403);
        }

        return $next($request);
    }
}
