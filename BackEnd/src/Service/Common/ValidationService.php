<?php

namespace App\Service\Common;

use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ValidationService
{
    private ValidatorInterface $validator;

    public function __construct(ValidatorInterface $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Valide une entité et retourne les erreurs sous forme de tableau
     */
    public function validateEntity($entity): array
    {
        $violations = $this->validator->validate($entity);
        
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }
        
        return $errors;
    }

    /**
     * Valide des données contre des contraintes spécifiques
     */
    public function validateData($data, $constraints): array
    {
        $violations = $this->validator->validate($data, $constraints);
        
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }
        
        return $errors;
    }

    /**
     * Valide un email
     */
    public function validateEmail(string $email): array
    {
        return $this->validateData($email, [
            new Assert\NotBlank(['message' => 'Email cannot be blank']),
            new Assert\Email(['message' => 'Invalid email format'])
        ]);
    }

    /**
     * Valide un mot de passe
     */
    public function validatePassword(string $password): array
    {
        return $this->validateData($password, [
            new Assert\NotBlank(['message' => 'Password cannot be blank']),
            new Assert\Length([
                'min' => 6,
                'minMessage' => 'Password must be at least {{ limit }} characters long'
            ])
        ]);
    }

    /**
     * Valide les données d'un quiz
     */
    public function validateQuizData(array $data): array
    {
        $constraints = new Assert\Collection([
            'title' => [
                new Assert\NotBlank(['message' => 'Title cannot be blank']),
                new Assert\Length([
                    'min' => 3,
                    'max' => 255,
                    'minMessage' => 'Title must be at least {{ limit }} characters long',
                    'maxMessage' => 'Title cannot be longer than {{ limit }} characters'
                ])
            ],
            'description' => [
                new Assert\Optional([
                    new Assert\Length([
                        'max' => 1000,
                        'maxMessage' => 'Description cannot be longer than {{ limit }} characters'
                    ])
                ])
            ]
        ]);

        return $this->validateData($data, $constraints);
    }

    /**
     * Valide les données d'une question
     */
    public function validateQuestionData(array $data): array
    {
        $constraints = new Assert\Collection([
            'content' => [
                new Assert\NotBlank(['message' => 'Question content cannot be blank']),
                new Assert\Length([
                    'min' => 10,
                    'max' => 1000,
                    'minMessage' => 'Question content must be at least {{ limit }} characters long',
                    'maxMessage' => 'Question content cannot be longer than {{ limit }} characters'
                ])
            ]
        ]);

        return $this->validateData($data, $constraints);
    }

    /**
     * Valide les données d'une réponse
     */
    public function validateAnswerData(array $data): array
    {
        $constraints = new Assert\Collection([
            'content' => [
                new Assert\NotBlank(['message' => 'Answer content cannot be blank']),
                new Assert\Length([
                    'min' => 1,
                    'max' => 1000,
                    'minMessage' => 'Answer content must be at least {{ limit }} character long',
                    'maxMessage' => 'Answer content cannot be longer than {{ limit }} characters'
                ])
            ],
            'isCorrect' => [
                new Assert\Type(['type' => 'bool', 'message' => 'isCorrect must be a boolean'])
            ]
        ]);

        return $this->validateData($data, $constraints);
    }

    /**
     * Vérifie si une entité est valide
     */
    public function isValid($entity): bool
    {
        return count($this->validateEntity($entity)) === 0;
    }
}
