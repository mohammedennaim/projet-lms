<?php

namespace App\Controller\Admin;

use App\Entity\Ressource;
use App\Entity\Course;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/ressources')]
#[IsGranted('ROLE_ADMIN')]
class RessourceAdminController extends AbstractController
{
    #[Route('', name: 'admin_ressource_index', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $ressources = $em->getRepository(Ressource::class)->findAll();
        
        return $this->json(
            $ressources,
            200,
            [],
            ['groups' => ['ressource:read']]
        );
    }

    #[Route('/{id}', name: 'admin_ressource_show', methods: ['GET'])]
    public function show(Ressource $ressource): JsonResponse
    {
        return $this->json(
            $ressource,
            200,
            [],
            ['groups' => ['ressource:read']]
        );
    }

    #[Route('', name: 'admin_ressource_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }
            
            $ressource = new Ressource();
            $ressource->setContenu($data['contenu'] ?? '');
            
            if (isset($data['course_id'])) {
                $course = $em->getRepository(Course::class)->find($data['course_id']);
                if ($course) {
                    $ressource->setCourse($course);
                } else {
                    return $this->json(['error' => 'Course not found'], 404);
                }
            }
            
            $em->persist($ressource);
            $em->flush();
            
            return $this->json(
                $ressource, 
                201,
                [],
                ['groups' => ['ressource:read']]
            );
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to create resource: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}', name: 'admin_ressource_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, Ressource $ressource, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }
            
            if (isset($data['contenu'])) {
                $ressource->setContenu($data['contenu']);
            }
            
            if (isset($data['course_id'])) {
                $course = $em->getRepository(Course::class)->find($data['course_id']);
                if ($course) {
                    $ressource->setCourse($course);
                } else {
                    return $this->json(['error' => 'Course not found'], 404);
                }
            }
            
            $em->flush();
            
            return $this->json(
                $ressource,
                200,
                [],
                ['groups' => ['ressource:read']]
            );
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to update resource: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}', name: 'admin_ressource_delete', methods: ['DELETE'])]
    public function delete(Ressource $ressource, EntityManagerInterface $em): JsonResponse
    {
        try {
            $em->remove($ressource);
            $em->flush();
            
            return $this->json(['message' => 'Resource successfully deleted'], 200);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to delete resource: ' . $e->getMessage()], 500);
        }
    }
}