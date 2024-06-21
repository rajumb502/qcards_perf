
select s.class_id::text, s.subject_id::text, json_agg(s.student_id::text) as student_ids, assQuestins.questionIds, assQuestins.csa_id, assQuestins.assessment_id from sssts s, (select csa.class_id, csa.subject_id, csa.csa_id::text, csa.assessment_id::text, json_agg(aq.question_id::text) as questionIds from class_subjects_assessments csa, assessment_questions aq where csa.assessment_id = aq.assessment_id  group by csa.class_id, csa.subject_id, csa.csa_id, aq.assessment_id) as assQuestins
where s.class_id = assQuestins.class_id and s.subject_id = assQuestins.subject_id group by assQuestins.csa_id, assQuestins.assessment_id, s.class_id, s.subject_id, assQuestins.questionIds order by s.class_id, s.subject_id limit 100