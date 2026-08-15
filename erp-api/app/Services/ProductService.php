<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProductService
{
    public function listForCompany(User $actor, ?string $search = null, ?bool $isActive = null): Collection
    {
        $this->ensureCompany($actor);

        return Product::query()
            ->where('company_id', $actor->company_id)
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('sku', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
            ))
            ->when(!is_null($isActive), fn ($query) => $query->where('is_active', $isActive))
            ->orderBy('name')
            ->get();
    }

    public function findForCompany(User $actor, Product $product): Product
    {
        $this->ensureSameCompany($actor, $product);
        return $product;
    }

    public function create(User $actor, array $data): Product
    {
        $this->ensureCompany($actor);

        if (($data['image'] ?? null) instanceof UploadedFile) {
            $data['image'] = $this->storeImage($actor, $data['image']);
        }

        return Product::create([
            ...$data,
            'company_id' => $actor->company_id,
        ]);
    }

    public function update(User $actor, Product $product, array $data): Product
    {
        $this->ensureSameCompany($actor, $product);

        if (($data['image'] ?? null) instanceof UploadedFile) {
            $newImage = $this->storeImage($actor, $data['image']);

            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $data['image'] = $newImage;
        }

        $product->update($data);
        return $product->fresh();
    }

    public function deactivate(User $actor, Product $product): void
    {
        $this->ensureSameCompany($actor, $product);
        $product->update(['is_active' => false]);
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException('You must belong to a company to manage products.');
        }
    }

    private function ensureSameCompany(User $actor, Product $product): void
    {
        if (! $actor->company_id || $product->company_id !== $actor->company_id) {
            throw new NotFoundHttpException('Product not found.');
        }
    }

    private function storeImage(User $actor, UploadedFile $image): string
    {
        return $image->store("products/{$actor->company_id}", 'public');
    }
}
