<?php

namespace App\Controller;

use App\Entity\Affectation;
use App\Repository\AffectationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/employee')]
#[IsGranted('ROLE_EMPLOYEE')]
class EmployeeController extends AbstractController
{
    public function __construct(
        private AffectationRepository $affectationRepository
    ) {
    }

    #[Route('/courses', name: 'app_employee_courses', methods: ['GET'])]
    public function getMyCourses(): JsonResponse
    {
        $user = $this->getUser();
        $affectations = $this->affectationRepository->findByUser($user);
        
        $courses = [];
        foreach ($affectations as $affectation) {
            $course = $affectation->getCours();
            $courses[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'dateAssigned' => $affectation->getDateAssigned()->format('Y-m-d'),
                'affectationId' => $affectation->getId()
            ];
        }
        
        return new JsonResponse($courses, Response::HTTP_OK);
    }
}
