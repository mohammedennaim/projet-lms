<?php

namespace App\Controller\Trait;

use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\Request;

trait PaginationTrait
{
    /**
     * Ajoute la pagination à un QueryBuilder
     */
    protected function paginate(QueryBuilder $queryBuilder, Request $request, int $defaultLimit = 10): array
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', $defaultLimit)));
        
        $firstResult = ($page - 1) * $limit;
        
        $queryBuilder
            ->setFirstResult($firstResult)
            ->setMaxResults($limit);
        
        $paginator = new Paginator($queryBuilder, true);
        
        $totalItems = count($paginator);
        $totalPages = (int) ceil($totalItems / $limit);
        
        return [
            'data' => iterator_to_array($paginator),
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_items' => $totalItems,
                'items_per_page' => $limit,
                'has_next_page' => $page < $totalPages,
                'has_previous_page' => $page > 1
            ]
        ];
    }

    /**
     * Génère les métadonnées de pagination
     */
    protected function getPaginationMetadata(int $totalItems, int $page, int $limit): array
    {
        $totalPages = (int) ceil($totalItems / $limit);
        
        return [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_items' => $totalItems,
            'items_per_page' => $limit,
            'has_next_page' => $page < $totalPages,
            'has_previous_page' => $page > 1
        ];
    }

    /**
     * Applique les filtres de recherche à un QueryBuilder
     */
    protected function applySearchFilters(QueryBuilder $queryBuilder, Request $request, array $searchableFields = []): QueryBuilder
    {
        $search = $request->query->get('search');
        
        if ($search && !empty($searchableFields)) {
            $orConditions = [];
            
            foreach ($searchableFields as $field) {
                $orConditions[] = $queryBuilder->expr()->like("e.$field", ':search');
            }
            
            if (!empty($orConditions)) {
                $queryBuilder
                    ->andWhere(call_user_func_array([$queryBuilder->expr(), 'orX'], $orConditions))
                    ->setParameter('search', '%' . $search . '%');
            }
        }
        
        return $queryBuilder;
    }

    /**
     * Applique le tri à un QueryBuilder
     */
    protected function applySorting(QueryBuilder $queryBuilder, Request $request, array $allowedSortFields = []): QueryBuilder
    {
        $sortBy = $request->query->get('sort_by');
        $sortOrder = $request->query->get('sort_order', 'ASC');
        
        if ($sortBy && in_array($sortBy, $allowedSortFields)) {
            $sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';
            $queryBuilder->orderBy("e.$sortBy", $sortOrder);
        }
        
        return $queryBuilder;
    }
}
