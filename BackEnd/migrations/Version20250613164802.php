<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613164802 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D37ECF78B0 FOREIGN KEY (cours_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6591CC992 FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE evaluation ADD CONSTRAINT FK_1323A5756D0ABA22 FOREIGN KEY (affectation_id) REFERENCES affectation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE question ADD CONSTRAINT FK_B6F7494E853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quiz ADD CONSTRAINT FK_A412FA92591CC992 FOREIGN KEY (course_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reponse ADD CONSTRAINT FK_5FB6DEC71E27F6BF FOREIGN KEY (question_id) REFERENCES question (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource ADD CONSTRAINT FK_939F4544591CC992 FOREIGN KEY (course_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response ADD CONSTRAINT FK_A56C00DCA9C0793D FOREIGN KEY (user_quiz_response_id) REFERENCES user_quiz_response (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response ADD CONSTRAINT FK_A56C00DC1E27F6BF FOREIGN KEY (question_id) REFERENCES question (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response ADD CONSTRAINT FK_A56C00DCC2C71BC6 FOREIGN KEY (selected_response_id) REFERENCES reponse (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_quiz_response ADD CONSTRAINT FK_6315FEEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_quiz_response ADD CONSTRAINT FK_6315FEE853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D3A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D37ECF78B0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource DROP FOREIGN KEY FK_939F4544591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reponse DROP FOREIGN KEY FK_5FB6DEC71E27F6BF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE question DROP FOREIGN KEY FK_B6F7494E853CD175
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE evaluation DROP FOREIGN KEY FK_1323A5756D0ABA22
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quiz DROP FOREIGN KEY FK_A412FA92591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response DROP FOREIGN KEY FK_A56C00DCA9C0793D
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response DROP FOREIGN KEY FK_A56C00DC1E27F6BF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_question_response DROP FOREIGN KEY FK_A56C00DCC2C71BC6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_quiz_response DROP FOREIGN KEY FK_6315FEEA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_quiz_response DROP FOREIGN KEY FK_6315FEE853CD175
        SQL);
    }
}
