import React, { useState, useRef, useEffect } from 'react';
import './SelfConsultationModal.css';

const QUESTIONS = [
  {
    id: 1,
    question: "Hola, soy tu asistente médico virtual. ¿Cuál es tu principal síntoma o molestia?",
    type: "text",
    key: "mainSymptom",
    followUp: (answer) => {
      const lower = answer.toLowerCase();
      if (lower.includes('dolor')) {
        return "Entiendo que tienes dolor. ¿Podrías describir más específicamente dónde sientes el dolor?";
      }
      if (lower.includes('fiebre') || lower.includes('temperatura')) {
        return "Veo que mencionas fiebre. Es importante evaluar esto. ¿Tienes forma de medir tu temperatura?";
      }
      return "Gracias por compartir eso. Voy a hacerte algunas preguntas para entender mejor tu situación.";
    }
  },
  {
    id: 2,
    question: "¿Desde cuándo presentas estos síntomas?",
    type: "select",
    options: ["Hoy", "Hace 1-3 días", "Hace 4-7 días", "Más de una semana", "Más de un mes"],
    key: "symptomDuration",
    followUp: (answer) => {
      if (answer.includes("Más de un mes")) {
        return "Entiendo que llevas más de un mes con estos síntomas. Es importante que consultes con un especialista pronto.";
      }
      if (answer.includes("Más de una semana")) {
        return "Una semana es un tiempo considerable. Vamos a evaluar la gravedad de tus síntomas.";
      }
      return "Bien, es relativamente reciente. Continuemos evaluando.";
    }
  },
  {
    id: 3,
    question: "¿Qué tan intenso es el dolor o molestia? (1-10)",
    type: "select",
    options: ["1-3 (Leve)", "4-6 (Moderado)", "7-8 (Fuerte)", "9-10 (Muy intenso)"],
    key: "painLevel",
    followUp: (answer) => {
      if (answer.includes("9-10") || answer.includes("7-8")) {
        return "Veo que el dolor es bastante intenso. Esto requiere atención médica. Te recomendaré la mejor opción al final.";
      }
      if (answer.includes("4-6")) {
        return "El dolor moderado puede ser manejable, pero aún así es importante evaluarlo adecuadamente.";
      }
      return "Bien, parece que el malestar es leve. Continuemos con la evaluación.";
    }
  },
  {
    id: 4,
    question: "¿Tienes fiebre?",
    type: "select",
    options: ["Sí", "No", "No estoy seguro"],
    key: "fever",
    followUp: (answer) => {
      if (answer === "Sí") {
        return "La fiebre es un síntoma importante que requiere atención. ¿Sabes qué temperatura tienes aproximadamente?";
      }
      if (answer === "No estoy seguro") {
        return "Si tienes acceso a un termómetro, sería útil medir tu temperatura. Mientras tanto, continuemos.";
      }
      return "Bien, no hay fiebre. Eso es una buena señal.";
    }
  },
  {
    id: 5,
    question: "¿Has tomado algún medicamento para esto?",
    type: "select",
    options: ["Sí", "No"],
    key: "medication",
    followUp: (answer) => {
      if (answer === "Sí") {
        return "Es importante que informes a tu médico sobre cualquier medicamento que hayas tomado. ¿Has notado alguna mejora?";
      }
      return "Entendido. Es importante no automedicarse sin supervisión médica.";
    }
  },
  {
    id: 6,
    question: "¿Tienes alguna condición médica preexistente o alergias?",
    type: "text",
    key: "existingConditions",
    followUp: (answer) => {
      if (answer.trim().toLowerCase() !== 'no' && answer.trim().toLowerCase() !== 'ninguna') {
        return "Gracias por compartir esa información. Es importante que tu médico esté al tanto de tus condiciones previas.";
      }
      return "Perfecto, eso facilita la evaluación.";
    }
  },
  {
    id: 7,
    question: "¿Hay algo más que quieras mencionar sobre tu condición?",
    type: "text",
    key: "additionalInfo",
    followUp: (answer) => {
      if (answer.trim()) {
        return "Gracias por esa información adicional. Ahora voy a analizar todo y darte mis recomendaciones.";
      }
      return "Perfecto, tengo suficiente información. Déjame analizar tu caso.";
    }
  }
];

const SPECIALTY_RECOMMENDATIONS = {
  "Medicina General": [
    "síntomas generales", "fiebre", "malestar general", "dolor de cabeza",
    "resfriado", "gripe", "dolor de garganta", "tos", "fatiga", "náuseas", "vómitos"
  ],
  "Obstetricia": [
    "embarazo", "gestación", "prenatal", "parto", "menstruación irregular",
    "dolor pélvico", "sangrado", "contracciones", "amenorrea", "menstrual"
  ],
  "Cardiología": [
    "dolor de pecho", "palpitaciones", "dificultad para respirar",
    "presión arterial", "corazón", "mareos", "desmayos", "dolor en el brazo",
    "taquicardia", "arritmia", "opresión en el pecho"
  ],
  "Odontología": [
    "dolor de muelas", "diente", "encías", "boca", "mandíbula",
    "sangrado de encías", "sensibilidad dental", "caries", "muela", "dental"
  ],
  "Nutrición": [
    "dieta", "alimentación", "peso", "obesidad", "desnutrición",
    "intolerancia", "alergia alimentaria", "nutrición", "comida", "bajar de peso"
  ]
};

const AI_RESPONSES = {
  analyzing: [
    "Analizando tus síntomas...",
    "Revisando la información proporcionada...",
    "Evaluando la gravedad de tu caso...",
    "Comparando con patrones médicos conocidos..."
  ],
  recommendations: {
    urgent: "Basado en la intensidad y duración de tus síntomas, te recomiendo agendar una cita de inmediato. Tu caso requiere atención médica profesional lo antes posible.",
    moderate: "Tus síntomas requieren atención médica profesional. Te recomiendo agendar una cita en los próximos días para una evaluación adecuada.",
    mild: "Aunque tus síntomas parecen leves, es importante que un profesional médico los evalúe para descartar cualquier condición subyacente y recibir el tratamiento adecuado."
  }
};

const SelfConsultationModal = ({ onClose, onScheduleAppointment }) => {
  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [recommendedSpecialty, setRecommendedSpecialty] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Inicializar chat
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(QUESTIONS[0].question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll al final del chat
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, delay = 0) => {
    if (delay > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { type: 'bot', text, timestamp: new Date() }]);
      }, delay);
    } else {
      setMessages(prev => [...prev, { type: 'bot', text, timestamp: new Date() }]);
    }
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
  };

  const simulateTyping = (callback, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return;

    // Agregar mensaje del usuario
    addUserMessage(currentAnswer);

    const newAnswers = {
      ...answers,
      [currentQuestion.key]: currentAnswer
    };
    setAnswers(newAnswers);

    // Respuesta contextual del bot
    if (currentQuestion.followUp) {
      const followUpText = currentQuestion.followUp(currentAnswer);
      simulateTyping(() => {
        addBotMessage(followUpText);
      }, 1000);
    }

    // Continuar con la siguiente pregunta o finalizar
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        simulateTyping(() => {
          addBotMessage(QUESTIONS[nextIndex].question);
        }, 1500);
        setCurrentAnswer('');
      }, currentQuestion.followUp ? 2500 : 1000);
    } else {
      // Generar diagnóstico
      setTimeout(() => {
        generateDiagnosis(newAnswers);
      }, currentQuestion.followUp ? 2500 : 1000);
    }
  };

  const generateDiagnosis = (allAnswers) => {
    // Mostrar mensaje de análisis
    addBotMessage("Déjame analizar toda la información que me has proporcionado...", 0);
    
    // Simular análisis con mensajes
    setTimeout(() => {
      addBotMessage("✓ Síntomas evaluados", 500);
    }, 1000);
    
    setTimeout(() => {
      addBotMessage("✓ Patrones médicos analizados", 500);
    }, 2000);

    setTimeout(() => {
      addBotMessage("✓ Recomendaciones generadas", 500);
    }, 3000);

    // Determinar especialidad recomendada con IA mejorada
    setTimeout(() => {
      const symptomText = (allAnswers.mainSymptom || '').toLowerCase();
      const additionalInfo = (allAnswers.additionalInfo || '').toLowerCase();
      const existingConditions = (allAnswers.existingConditions || '').toLowerCase();
      const combinedText = `${symptomText} ${additionalInfo} ${existingConditions}`;

      let specialtyScores = {};
      
      Object.keys(SPECIALTY_RECOMMENDATIONS).forEach(specialty => {
        const keywords = SPECIALTY_RECOMMENDATIONS[specialty];
        const score = keywords.reduce((acc, keyword) => {
          if (combinedText.includes(keyword.toLowerCase())) {
            return acc + 2; // Peso mayor para coincidencias
          }
          return acc;
        }, 0);
        specialtyScores[specialty] = score;
      });

      // Análisis adicional basado en síntomas específicos
      const painLevel = allAnswers.painLevel || '';
      const duration = allAnswers.symptomDuration || '';
      const fever = allAnswers.fever || '';

      // Ajustar scores según contexto
      if (fever === 'Sí' && specialtyScores['Medicina General'] === 0) {
        specialtyScores['Medicina General'] = 3;
      }

      if (painLevel.includes('9-10') && combinedText.includes('pecho')) {
        specialtyScores['Cardiología'] = (specialtyScores['Cardiología'] || 0) + 5;
      }

      const maxScore = Math.max(...Object.values(specialtyScores));
      const recommended = maxScore > 0
        ? Object.keys(specialtyScores).find(key => specialtyScores[key] === maxScore)
        : 'Medicina General';

      setRecommendedSpecialty(recommended);

      // Generar diagnóstico inteligente
      let diagnosisText = `📋 **Resumen de tu consulta:**\n\n`;
      diagnosisText += `• **Síntoma principal:** ${allAnswers.mainSymptom || 'No especificado'}\n`;
      diagnosisText += `• **Duración:** ${allAnswers.symptomDuration || 'No especificado'}\n`;
      diagnosisText += `• **Intensidad:** ${allAnswers.painLevel || 'No especificado'}\n`;
      diagnosisText += `• **Fiebre:** ${allAnswers.fever || 'No especificado'}\n`;
      if (allAnswers.existingConditions) {
        diagnosisText += `• **Condiciones previas:** ${allAnswers.existingConditions}\n`;
      }
      diagnosisText += `\n`;

      // Recomendaciones inteligentes
      let recommendationText = '';

      if (painLevel.includes('9-10') || painLevel.includes('7-8')) {
        recommendationText = AI_RESPONSES.recommendations.urgent;
      } else if (fever === 'Sí' || duration.includes('Más de una semana')) {
        recommendationText = AI_RESPONSES.recommendations.moderate;
      } else {
        recommendationText = AI_RESPONSES.recommendations.mild;
      }

      diagnosisText += `💡 **Mi recomendación:**\n\n`;
      diagnosisText += `${recommendationText}\n\n`;
      diagnosisText += `Basado en el análisis de tus síntomas, te recomiendo agendar una cita con **${recommended}**.\n\n`;
      
      // Consejos adicionales
      if (fever === 'Sí') {
        diagnosisText += `🌡️ **Consejo:** Mientras tanto, mantente hidratado y descansa. Si la fiebre supera los 38.5°C, considera atención inmediata.\n\n`;
      }
      
      if (painLevel.includes('9-10')) {
        diagnosisText += `⚠️ **Importante:** Dado el nivel de dolor que describes, no dudes en buscar atención médica de emergencia si el dolor empeora.\n\n`;
      }

      diagnosisText += `📌 **Nota importante:** Esta es una evaluación preliminar basada en inteligencia artificial. No reemplaza una consulta médica profesional. Si tus síntomas empeoran o tienes dudas, busca atención médica inmediata.`;
      
      // Mostrar resultado en el chat
      setTimeout(() => {
        addBotMessage("He completado mi análisis. Aquí están mis recomendaciones:", 0);
        setTimeout(() => {
          addBotMessage(diagnosisText, 0);
          setTimeout(() => {
            addBotMessage(`🎯 **Especialidad recomendada: ${recommended}**\n\n¿Te gustaría agendar una cita ahora?`, 0);
            setShowResult(true);
          }, 1000);
        }, 500);
      }, 4000);
    }, 4000);
  };

  const handleSchedule = () => {
    addUserMessage("Sí, quiero agendar una cita");
    simulateTyping(() => {
      addBotMessage("Perfecto, voy a abrir el formulario de agendamiento para ti. ¡Espero que te sientas mejor pronto! 👨‍⚕️");
      setTimeout(() => {
        onScheduleAppointment(recommendedSpecialty);
      }, 1500);
    }, 1000);
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer('');
    setShowResult(false);
    setRecommendedSpecialty(null);
    setTimeout(() => {
      addBotMessage(QUESTIONS[0].question);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showResult) {
      e.preventDefault();
      handleAnswer();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="self-consultation-modal chat-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>&times;</span>
        
        <div className="consultation-header">
          <h2>🤖 Asistente Médico Virtual</h2>
          <p>Conversa conmigo sobre tus síntomas y te daré recomendaciones personalizadas</p>
        </div>

        <div className="chat-container" ref={chatEndRef}>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'bot' && (
                    <div className="bot-avatar">🤖</div>
                  )}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="bot-avatar">🤖</div>
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!showResult && currentQuestion && (
              <div className="chat-input-section">
                {currentQuestion.type === 'text' ? (
                  <div className="input-wrapper">
                    <textarea
                      ref={inputRef}
                      className="chat-input"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows="3"
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      className="send-btn"
                      onClick={handleAnswer}
                      disabled={!currentAnswer.trim()}
                    >
                      Enviar →
                    </button>
                  </div>
                ) : (
                  <div className="options-wrapper">
                    <p className="options-label">Selecciona una opción:</p>
                    <div className="answer-options">
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`option-btn ${currentAnswer === option ? 'selected' : ''}`}
                          onClick={() => {
                            setCurrentAnswer(option);
                            setTimeout(() => handleAnswer(), 300);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showResult && (
              <div className="result-actions-chat">
                <button
                  type="button"
                  className="btn-primary large"
                  onClick={handleSchedule}
                >
                  📅 Agendar Cita con {recommendedSpecialty}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRestart}
                >
                  🔄 Nueva Consulta
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfConsultationModal;
