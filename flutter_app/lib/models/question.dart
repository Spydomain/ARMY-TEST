
class Question {
  final String id;
  final String category;
  final String image;
  final Map<String, String> title;
  final Map<String, List<String>>? options;
  final Map<String, String> correctAnswer;
  final int correctAnswerIndex;
  final Map<String, String>? description;

  Question({
    required this.id,
    required this.category,
    required this.image,
    required this.title,
    this.options,
    required this.correctAnswer,
    required this.correctAnswerIndex,
    this.description,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      category: json['category'],
      image: json['image'],
      title: Map<String, String>.from(json['title']),
      options: (json['options'] as Map<String, dynamic>?)?.map(
        (key, value) => MapEntry(
          key,
          (value as List).map((item) => item as String).toList(),
        ),
      ),
      correctAnswer: Map<String, String>.from(json['correctAnswer']),
      correctAnswerIndex: json['correctAnswerIndex'] as int,
      description: json['description'] != null
          ? Map<String, String>.from(json['description'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'image': image,
      'title': title,
      'options': options,
      'correctAnswer': correctAnswer,
      'correctAnswerIndex': correctAnswerIndex,
      'description': description,
    };
  }
}
