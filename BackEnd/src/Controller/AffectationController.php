<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\AffectationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/affectations')]
class AffectationController extends AbstractController
{
    public function __construct(
        private AffectationRepository $affectationRepository,
        private SerializerInterface $serializer
    ) {}

    /**
     * Get courses assigned to current user (for employees)
     */
    #[Route('/my-courses', name: 'my_courses', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYEE')]
    public function getMyCourses(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(
                ['error' => 'User not authenticated'], 
                Response::HTTP_UNAUTHORIZED
            );
        }

        $affectations = $this->affectationRepository->findBy(['user' => $user]);

        $data = $this->serializer->serialize(
            $affectations, 
            'json', 
            ['groups' => ['affectation:read', 'affectation:details']]
        );

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }
}
