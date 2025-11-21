
import 'package:flutter_app/models/question.dart';

class Test {
  final String id;
  final String category;
  final int score;
  final int totalQuestions;
  final DateTime date;
  final List<Question> questions;
  final List<dynamic> answers;
  final String mode;

  Test({
    required this.id,
    required this.category,
    required this.score,
    required this.totalQuestions,
    required this.date,
    required this.questions,
    required this.answers,
    required this.mode,
  });

  factory Test.fromJson(Map<String, dynamic> json) {
    return Test(
      id: json['id'],
      category: json['category'],
      score: json['score'],
      totalQuestions: json['totalQuestions'],
      date: DateTime.parse(json['date']),
      questions:
          (json['questions'] as List).map((q) => Question.fromJson(q)).toList(),
      answers: json['answers'] as List,
      mode: json['mode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'score': score,
      'totalQuestions': totalQuestions,
      'date': date.toIso8601String(),
      'questions': questions.map((q) => q.toJson()).toList(),
      'answers': answers,
      'mode': mode,
    };
  }
}
