
class TestResult {
  final String testId;
  final DateTime date;
  final int score;
  final int questionCount;
  final String mode;

  TestResult({
    required this.testId,
    required this.date,
    required this.score,
    required this.questionCount,
    required this.mode,
  });

  // Methods for JSON serialization, which we'll need for storing in shared_preferences
  factory TestResult.fromJson(Map<String, dynamic> json) {
    return TestResult(
      testId: json['testId'],
      date: DateTime.parse(json['date']),
      score: json['score'],
      questionCount: json['questionCount'],
      mode: json['mode'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'testId': testId,
        'date': date.toIso8601String(),
        'score': score,
        'questionCount': questionCount,
        'mode': mode,
      };
}
