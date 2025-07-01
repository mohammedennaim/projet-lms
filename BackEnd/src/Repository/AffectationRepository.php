<?php

namespace App\Repository;

use App\Entity\Affectation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Affectation>
 */
class AffectationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Affectation::class);
    }

    /**
     * Récupère tous les cours assignés à un employé spécifique
     */
    public function findByUser(User $user)
    {
        return $this->createQueryBuilder('a')
            ->where('a.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère toutes les affectations avec leurs évaluations
     */
    public function findAllWithEvaluations()
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.evaluations', 'e')
            ->leftJoin('a.user', 'u')
            ->leftJoin('a.cours', 'c')
            ->addSelect('e')
            ->addSelect('u')
            ->addSelect('c')
            ->orderBy('a.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
