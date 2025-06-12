<?php
namespace App\Controller\Admin;

use App\Entity\Ressource;
use App\Entity\Course;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/ressources')]
#[IsGranted('ROLE_ADMIN')]
class RessourceAdminController extends AbstractController
{    #[Route('/', name: 'admin_ressource_index', methods: ['GET'])]
    public function index(EntityManagerInterface $em): Response
    {
        $ressources = $em->getRepository(Ressource::class)->findAll();
        return $this->json(
            $ressources,
            200,
            [],
            ['groups' => ['ressource:read']]
        );
    }    #[Route('/{id}', name: 'admin_ressource_show', methods: ['GET'])]
    public function show(Ressource $ressource): Response
    {
        return $this->json(
            $ressource,
            200,
            [],
            ['groups' => ['ressource:read']]
        );
    }    #[Route('/', name: 'admin_ressource_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);
        $ressource = new Ressource();
        $ressource->setContenu($data['contenu'] ?? '');
        if (isset($data['course_id'])) {
            $course = $em->getRepository(Course::class)->find($data['course_id']);
            if ($course) {
                $ressource->setCourse($course);
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
    }    #[Route('/{id}', name: 'admin_ressource_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, Ressource $ressource, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);
        if (isset($data['contenu'])) {
            $ressource->setContenu($data['contenu']);
        }
        if (isset($data['course_id'])) {
            $course = $em->getRepository(Course::class)->find($data['course_id']);
            if ($course) {
                $ressource->setCourse($course);
            }
        }
        $em->flush();
        return $this->json(
            $ressource,
            200,
            [],
            ['groups' => ['ressource:read']]
        );
    }

    #[Route('/{id}', name: 'admin_ressource_delete', methods: ['DELETE'])]
    public function delete(Ressource $ressource, EntityManagerInterface $em): Response
    {
        $em->remove($ressource);
        $em->flush();
        return $this->json(['message' => 'Resource successfully deleted'], 200);
    }
} 