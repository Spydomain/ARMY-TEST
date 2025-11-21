
class TestHistory {
  final String id;
  final String category;
  final int ts;
  final String mode;
  final int correct;
  final int total;
  final double percentage;

  TestHistory({
    required this.id,
    required this.category,
    required this.ts,
    required this.mode,
    required this.correct,
    required this.total,
    required this.percentage,
  });

  factory TestHistory.fromJson(Map<String, dynamic> json) {
    return TestHistory(
      id: json['id'],
      category: json['category'],
      ts: json['ts'],
      mode: json['mode'],
      correct: json['correct'],
      total: json['total'],
      percentage: json['percentage'].toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'category': category,
        'ts': ts,
        'mode': mode,
        'correct': correct,
        'total': total,
        'percentage': percentage,
      };
}
