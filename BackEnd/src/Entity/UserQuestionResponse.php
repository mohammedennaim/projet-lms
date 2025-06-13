<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\UserQuestionResponseRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserQuestionResponseRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['user_question_response:read']],
    denormalizationContext: ['groups' => ['user_question_response:write']]
)]
class UserQuestionResponse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_quiz_response:read', 'user_question_response:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'questionResponses')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_question_response:read', 'user_question_response:write'])]
    private ?UserQuizResponse $userQuizResponse = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_quiz_response:read', 'user_question_response:read', 'user_question_response:write'])]
    private ?Question $question = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_quiz_response:read', 'user_question_response:read', 'user_question_response:write'])]
    private ?Reponse $selectedResponse = null;

    #[ORM\Column]
    #[Groups(['user_quiz_response:read', 'user_question_response:read'])]
    private ?bool $isCorrect = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserQuizResponse(): ?UserQuizResponse
    {
        return $this->userQuizResponse;
    }

    public function setUserQuizResponse(?UserQuizResponse $userQuizResponse): static
    {
        $this->userQuizResponse = $userQuizResponse;

        return $this;
    }

    public function getQuestion(): ?Question
    {
        return $this->question;
    }

    public function setQuestion(?Question $question): static
    {
        $this->question = $question;

        return $this;
    }

    public function getSelectedResponse(): ?Reponse
    {
        return $this->selectedResponse;
    }

    public function setSelectedResponse(?Reponse $selectedResponse): static
    {
        $this->selectedResponse = $selectedResponse;
        // Déterminer si la réponse sélectionnée est correcte
        $this->isCorrect = $selectedResponse->isIsCorrect();

        return $this;
    }

    public function isIsCorrect(): ?bool
    {
        return $this->isCorrect;
    }

    public function setIsCorrect(bool $isCorrect): static
    {
        $this->isCorrect = $isCorrect;

        return $this;
    }
}
