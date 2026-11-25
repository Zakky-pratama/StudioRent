<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::withCount('equipments')->orderBy('id');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('nama_kategori', 'like', "%{$search}%");
        }

        return CategoryResource::collection($query->get());
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return (new CategoryResource($category->loadCount('equipments')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, string $id): CategoryResource
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return new CategoryResource($category->loadCount('equipments'));
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->equipments()->exists()) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh data alat atau studio.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
