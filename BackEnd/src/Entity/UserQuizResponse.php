<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\UserQuizResponseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserQuizResponseRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['user_quiz_response:read']],
    denormalizationContext: ['groups' => ['user_quiz_response:write']]
)]
class UserQuizResponse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_quiz_response:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_quiz_response:read', 'user_quiz_response:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_quiz_response:read', 'user_quiz_response:write'])]
    private ?Quiz $quiz = null;
    
    #[ORM\Column]
    #[Groups(['user_quiz_response:read'])]
    private ?\DateTimeImmutable $submittedAt = null;
    
    #[ORM\Column]
    #[Groups(['user_quiz_response:read', 'user_quiz_response:write'])]
    private ?float $score = null;
    
    #[ORM\Column]
    #[Groups(['user_quiz_response:read'])]
    private ?int $totalQuestions = null;
    
    #[ORM\Column]
    #[Groups(['user_quiz_response:read'])]
    private ?int $correctAnswers = null;
    
    #[ORM\Column]
    #[Groups(['user_quiz_response:read'])]
    private ?int $timeSpentSeconds = null;
    
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['user_quiz_response:read'])]
    private ?string $feedback = null;
    
    #[ORM\OneToMany(mappedBy: 'userQuizResponse', targetEntity: UserQuestionResponse::class, orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['user_quiz_response:read', 'user_quiz_response:write'])]
    private Collection $questionResponses;

    public function __construct()
    {
        $this->submittedAt = new \DateTimeImmutable();
        $this->questionResponses = new ArrayCollection();
        $this->score = 0.0;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getQuiz(): ?Quiz
    {
        return $this->quiz;
    }

    public function setQuiz(?Quiz $quiz): static
    {
        $this->quiz = $quiz;

        return $this;
    }

    public function getSubmittedAt(): ?\DateTimeImmutable
    {
        return $this->submittedAt;
    }

    public function setSubmittedAt(\DateTimeImmutable $submittedAt): static
    {
        $this->submittedAt = $submittedAt;

        return $this;
    }

    public function getScore(): ?float
    {
        return $this->score;
    }

    public function setScore(float $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getTotalQuestions(): ?int
    {
        return $this->totalQuestions;
    }

    public function setTotalQuestions(int $totalQuestions): static
    {
        $this->totalQuestions = $totalQuestions;

        return $this;
    }

    public function getCorrectAnswers(): ?int
    {
        return $this->correctAnswers;
    }

    public function setCorrectAnswers(int $correctAnswers): static
    {
        $this->correctAnswers = $correctAnswers;

        return $this;
    }

    public function getTimeSpentSeconds(): ?int
    {
        return $this->timeSpentSeconds;
    }

    public function setTimeSpentSeconds(?int $timeSpentSeconds): static
    {
        $this->timeSpentSeconds = $timeSpentSeconds;

        return $this;
    }

    public function getFeedback(): ?string
    {
        return $this->feedback;
    }

    public function setFeedback(?string $feedback): static
    {
        $this->feedback = $feedback;

        return $this;
    }

    /**
     * Calculate and return the percentage score
     */
    public function getPercentageScore(): float
    {
        if ($this->totalQuestions === 0) {
            return 0.0;
        }
        return round(($this->correctAnswers / $this->totalQuestions) * 100, 2);
    }

    /**
     * Get performance level based on score
     */
    public function getPerformanceLevel(): string
    {
        $percentage = $this->getPercentageScore();
        
        if ($percentage >= 90) {
            return 'Excellent';
        } elseif ($percentage >= 80) {
            return 'Très bien';
        } elseif ($percentage >= 70) {
            return 'Bien';
        } elseif ($percentage >= 60) {
            return 'Satisfaisant';
        } elseif ($percentage >= 50) {
            return 'Passable';
        } else {
            return 'Insuffisant';
        }
    }

    /**
     * @return Collection<int, UserQuestionResponse>
     */
    public function getQuestionResponses(): Collection
    {
        return $this->questionResponses;
    }

    public function addQuestionResponse(UserQuestionResponse $questionResponse): static
    {
        if (!$this->questionResponses->contains($questionResponse)) {
            $this->questionResponses->add($questionResponse);
            $questionResponse->setUserQuizResponse($this);
        }

        return $this;
    }

    public function removeQuestionResponse(UserQuestionResponse $questionResponse): static
    {
        if ($this->questionResponses->removeElement($questionResponse)) {
            // set the owning side to null (unless already changed)
            if ($questionResponse->getUserQuizResponse() === $this) {
                $questionResponse->setUserQuizResponse(null);
            }
        }

        return $this;
    }
}
