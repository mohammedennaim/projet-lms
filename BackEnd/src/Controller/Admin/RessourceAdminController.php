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
    }    #[Route('', name: 'admin_ressource_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }
            
            // Validation des données requises
            if (empty($data['contenu'])) {
                return $this->json(['error' => 'L\'URL de la vidéo est requise'], 400);
            }
            
            if (empty($data['course_id'])) {
                return $this->json(['error' => 'L\'ID du cours est requis'], 400);
            }
            
            // Validation de l'URL
            $videoUrl = trim($data['contenu']);
            if (!filter_var($videoUrl, FILTER_VALIDATE_URL)) {
                return $this->json(['error' => 'L\'URL fournie n\'est pas valide'], 400);
            }
            
            // Vérifier que l'URL utilise HTTP ou HTTPS
            $parsedUrl = parse_url($videoUrl);
            if (!in_array($parsedUrl['scheme'] ?? '', ['http', 'https'])) {
                return $this->json(['error' => 'L\'URL doit utiliser le protocole HTTP ou HTTPS'], 400);
            }
            
            $ressource = new Ressource();
            $ressource->setContenu($videoUrl);
            
            // Vérifier que le cours existe
            $course = $em->getRepository(Course::class)->find($data['course_id']);
            if (!$course) {
                return $this->json(['error' => 'Le cours spécifié n\'existe pas'], 404);
            }
            
            $ressource->setCourse($course);
            
            $em->persist($ressource);
            $em->flush();
            
            return $this->json(
                $ressource, 
                201,
                [],
                ['groups' => ['ressource:read']]
            );
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la création de la ressource: ' . $e->getMessage()], 500);
        }
    }    #[Route('/{id}', name: 'admin_ressource_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, Ressource $ressource, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }
            
            if (isset($data['contenu'])) {
                $videoUrl = trim($data['contenu']);
                
                // Validation de l'URL si elle est fournie
                if (!empty($videoUrl)) {
                    if (!filter_var($videoUrl, FILTER_VALIDATE_URL)) {
                        return $this->json(['error' => 'L\'URL fournie n\'est pas valide'], 400);
                    }
                    
                    // Vérifier que l'URL utilise HTTP ou HTTPS
                    $parsedUrl = parse_url($videoUrl);
                    if (!in_array($parsedUrl['scheme'] ?? '', ['http', 'https'])) {
                        return $this->json(['error' => 'L\'URL doit utiliser le protocole HTTP ou HTTPS'], 400);
                    }
                }
                
                $ressource->setContenu($videoUrl);
            }
            
            if (isset($data['course_id'])) {
                $course = $em->getRepository(Course::class)->find($data['course_id']);
                if ($course) {
                    $ressource->setCourse($course);
                } else {
                    return $this->json(['error' => 'Le cours spécifié n\'existe pas'], 404);
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
            return $this->json(['error' => 'Erreur lors de la mise à jour de la ressource: ' . $e->getMessage()], 500);
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