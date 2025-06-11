<?php

namespace App\Repository;

use App\Entity\Course;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Course>
 */
class CourseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Course::class);
    }

    /**
     * Search courses by title or description
     */
    public function searchCourses(string $searchTerm): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.title LIKE :search OR c.description LIKE :search')
            ->setParameter('search', '%' . $searchTerm . '%')
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find courses with pagination
     */
    public function findCoursesWithPagination(int $page = 1, int $limit = 10): array
    {
        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('c')
            ->orderBy('c.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count total courses
     */
    public function countTotalCourses(): int
    {
        return $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }    /**
     * Find courses with most employees
     */
    public function findPopularCourses(int $limit = 5): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.employees', 'e')
            ->groupBy('c.id')
            ->orderBy('COUNT(e.id)', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent courses
     */
    public function findRecentCourses(int $limit = 5): array
    {
        return $this->findBy(
            [],
            ['createdAt' => 'DESC'],
            $limit
        );
    }
}
