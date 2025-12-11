import React, { useState, useRef, useEffect } from 'react';
import './SelfConsultationModal.css';

// Función para generar preguntas dinámicas basadas en respuestas anteriores
const getNextQuestion = (answers, currentIndex) => {
  const mainSymptom = (answers.mainSymptom || '').toLowerCase();
  const symptomDuration = answers.symptomDuration || '';
  const painLevel = answers.painLevel || '';
  const fever = answers.fever || '';
  const medication = answers.medication || '';

  // Pregunta 1: Síntoma principal (siempre primera)
  if (currentIndex === 0) {
    return {
      id: 1,
      question: "Hola, soy tu asistente médico virtual. Selecciona tu principal síntoma o molestia:",
      type: "select",
      options: [
        "Dolor de cabeza",
        "Fiebre o temperatura elevada",
        "Tos o malestar respiratorio",
        "Dolor de garganta",
        "Dolor de estómago o abdominal",
        "Dolor en el pecho",
        "Malestar general / cuerpo cortado",
        "Otro síntoma general"
      ],
      key: "mainSymptom"
    };
  }

  // Pregunta 2: Duración (siempre segunda)
  if (currentIndex === 1) {
    let question = "¿Desde cuándo presentas estos síntomas?";
    
    // Personalizar según el síntoma
    if (mainSymptom.includes('dolor')) {
      question = "¿Desde cuándo sientes este dolor?";
    } else if (mainSymptom.includes('fiebre') || mainSymptom.includes('temperatura')) {
      question = "¿Desde cuándo tienes fiebre?";
    } else if (mainSymptom.includes('tos')) {
      question = "¿Desde cuándo tienes tos?";
    } else if (mainSymptom.includes('nausea') || mainSymptom.includes('náusea') || mainSymptom.includes('vomito')) {
      question = "¿Desde cuándo tienes estos síntomas digestivos?";
    }

    return {
      id: 2,
      question: question,
      type: "select",
      options: ["Hoy", "Hace 1-3 días", "Hace 4-7 días", "Más de una semana", "Más de un mes"],
      key: "symptomDuration"
    };
  }

  // Pregunta 3: Intensidad (solo si hay dolor o molestia)
  if (currentIndex === 2) {
    // Si no mencionó dolor, saltar esta pregunta
    if (!mainSymptom.includes('dolor') && !mainSymptom.includes('molestia') && 
        !mainSymptom.includes('malestar') && !mainSymptom.includes('ardor') &&
        !mainSymptom.includes('picazón') && !mainSymptom.includes('comezón')) {
      return getNextQuestion(answers, currentIndex + 1);
    }

    let question = "¿Qué tan intenso es el dolor o molestia? (1-10)";
    
    // Personalizar según el tipo de síntoma
    if (mainSymptom.includes('dolor de cabeza') || mainSymptom.includes('cefalea')) {
      question = "¿Qué tan intenso es el dolor de cabeza? (1-10)";
    } else if (mainSymptom.includes('dolor de pecho')) {
      question = "¿Qué tan intenso es el dolor en el pecho? (1-10)";
    } else if (mainSymptom.includes('dolor de estómago') || mainSymptom.includes('dolor abdominal')) {
      question = "¿Qué tan intenso es el dolor abdominal? (1-10)";
    } else if (mainSymptom.includes('dolor de garganta')) {
      question = "¿Qué tan intenso es el dolor de garganta? (1-10)";
    }

    return {
      id: 3,
      question: question,
      type: "select",
      options: ["1-3 (Leve)", "4-6 (Moderado)", "7-8 (Fuerte)", "9-10 (Muy intenso)"],
      key: "painLevel"
    };
  }

  // Pregunta 4: Fiebre (siempre importante)
  if (currentIndex === 3) {
    // Si ya mencionó fiebre en el síntoma principal, hacer pregunta más específica
    if (mainSymptom.includes('fiebre') || mainSymptom.includes('temperatura')) {
      return {
        id: 4,
        question: "¿Sabes qué temperatura tienes aproximadamente?",
        type: "select",
        options: ["Menos de 37.5°C (Normal)", "37.5°C - 38°C (Fiebre leve)", "38°C - 39°C (Fiebre moderada)", "Más de 39°C (Fiebre alta)", "No lo sé"],
        key: "fever"
      };
    }

    return {
      id: 4,
      question: "¿Tienes fiebre o has sentido que tu temperatura está elevada?",
      type: "select",
      options: ["Sí", "No", "No estoy seguro"],
      key: "fever"
    };
  }

  // Pregunta 5: Síntomas adicionales (contextual)
  if (currentIndex === 4) {
    let question = "¿Tienes algún otro síntoma adicional?";
    let options = ["Ninguno", "Náuseas o vómitos", "Dolor de cabeza", "Fatiga o cansancio", "Dificultad para respirar", "Otro"];

    // Personalizar según el síntoma principal
    if (mainSymptom.includes('dolor de cabeza')) {
      question = "¿Tienes algún otro síntoma además del dolor de cabeza?";
      options = ["Ninguno", "Náuseas", "Sensibilidad a la luz", "Fiebre", "Visión borrosa", "Otro"];
    } else if (mainSymptom.includes('dolor de pecho')) {
      question = "¿Tienes algún otro síntoma además del dolor en el pecho?";
      options = ["Ninguno", "Dificultad para respirar", "Sudoración", "Náuseas", "Dolor en el brazo", "Otro"];
    } else if (mainSymptom.includes('dolor de estómago') || mainSymptom.includes('dolor abdominal')) {
      question = "¿Tienes algún otro síntoma digestivo?";
      options = ["Ninguno", "Náuseas", "Vómitos", "Diarrea", "Estreñimiento", "Otro"];
    } else if (mainSymptom.includes('tos')) {
      question = "¿Tienes algún otro síntoma respiratorio?";
      options = ["Ninguno", "Congestión nasal", "Dolor de garganta", "Fiebre", "Dificultad para respirar", "Otro"];
    }

    return {
      id: 5,
      question: question,
      type: "select",
      options: options,
      key: "additionalSymptoms"
    };
  }

  // Pregunta 6: Medicamentos
  if (currentIndex === 5) {
    return {
      id: 6,
      question: "¿Has tomado algún medicamento para aliviar estos síntomas?",
      type: "select",
      options: ["Sí, y me ayudó", "Sí, pero no me ayudó mucho", "No he tomado nada"],
      key: "medication"
    };
  }

  // Pregunta 7: Condiciones preexistentes
  if (currentIndex === 6) {
    return {
      id: 7,
      question: "¿Tienes alguna condición médica preexistente o alergias importantes?",
      type: "select",
      options: [
        "No, ninguna conocida",
        "Hipertensión / problemas del corazón",
        "Diabetes",
        "Asma u otros problemas respiratorios",
        "Alergia a medicamentos (por ejemplo, penicilina)",
        "Embarazo o sospecha de embarazo",
        "Otra condición importante"
      ],
      key: "existingConditions"
    };
  }

  // Pregunta 8: Información adicional
  if (currentIndex === 7) {
    return {
      id: 8,
      question: "¿Qué tan urgente sientes tu situación?",
      type: "select",
      options: [
        "Es leve, solo quiero una orientación",
        "Me preocupa, pero puedo esperar unas horas",
        "Siento que es urgente",
        "No estoy seguro"
      ],
      key: "additionalInfo"
    };
  }

  return null; // No hay más preguntas
};

// Función para generar respuestas contextuales
const getContextualResponse = (question, answer, allAnswers) => {
  const mainSymptom = (allAnswers.mainSymptom || '').toLowerCase();
  const answerLower = answer.toLowerCase();

  // Respuestas para síntoma principal
  if (question.key === 'mainSymptom') {
    if (answerLower.includes('dolor de pecho')) {
      return "El dolor en el pecho es un síntoma que debemos evaluar cuidadosamente. Voy a hacerte algunas preguntas importantes.";
    }
    if (answerLower.includes('dolor de cabeza')) {
      return "Entiendo que tienes dolor de cabeza. Hay diferentes tipos y causas, así que necesito más información.";
    }
    if (answerLower.includes('fiebre')) {
      return "La fiebre puede indicar una infección. Es importante evaluar su intensidad y duración.";
    }
    if (answerLower.includes('tos')) {
      return "La tos puede tener varias causas. Vamos a evaluar si es seca o con flemas, y otros síntomas asociados.";
    }
    if (answerLower.includes('dolor de estómago') || answerLower.includes('dolor abdominal')) {
      return "El dolor abdominal puede tener diferentes causas. Necesito más detalles para ayudarte mejor.";
    }
    if (answerLower.includes('dolor de garganta')) {
      return "El dolor de garganta es común y puede ser causado por varias razones. Continuemos evaluando.";
    }
    return "Gracias por compartir eso. Voy a hacerte algunas preguntas para entender mejor tu situación.";
  }

  // Respuestas para duración
  if (question.key === 'symptomDuration') {
    if (answer.includes("Más de un mes")) {
      return "Llevas más de un mes con estos síntomas. Es importante que consultes con un especialista pronto para una evaluación adecuada.";
    }
    if (answer.includes("Más de una semana")) {
      return "Una semana es un tiempo considerable. Vamos a evaluar la gravedad para determinar la mejor atención.";
    }
    if (answer.includes("Hace 4-7 días")) {
      return "Varios días con síntomas. Continuemos evaluando para darte la mejor recomendación.";
    }
    return "Es relativamente reciente. Continuemos con la evaluación.";
  }

  // Respuestas para intensidad
  if (question.key === 'painLevel') {
    if (answer.includes("9-10") || answer.includes("7-8")) {
      return "El dolor es bastante intenso. Esto requiere atención médica profesional. Te daré recomendaciones específicas al final.";
    }
    if (answer.includes("4-6")) {
      return "El dolor moderado puede ser manejable, pero aún así es importante que un profesional lo evalúe adecuadamente.";
    }
    return "Bien, parece que el malestar es leve. Aún así, es importante evaluarlo para descartar cualquier problema.";
  }

  // Respuestas para fiebre
  if (question.key === 'fever') {
    if (answer.includes("Más de 39°C") || answer.includes("Fiebre alta")) {
      return "Una fiebre alta requiere atención médica. Te recomendaré agendar una cita de inmediato.";
    }
    if (answer === "Sí" || answer.includes("Fiebre")) {
      return "La fiebre es un síntoma importante. Continuemos evaluando para determinar la mejor atención.";
    }
    return "Bien, no hay fiebre. Eso es una buena señal, pero continuemos evaluando tus otros síntomas.";
  }

  // Respuestas para síntomas adicionales
  if (question.key === 'additionalSymptoms') {
    if (answer.includes("Dificultad para respirar")) {
      return "La dificultad para respirar es un síntoma importante que requiere atención médica. Lo tendré en cuenta en mis recomendaciones.";
    }
    if (answer !== "Ninguno") {
      return "Entiendo. Estos síntomas adicionales son importantes para una evaluación completa.";
    }
    return "Bien, no hay síntomas adicionales. Continuemos.";
  }

  // Respuestas para medicamentos
  if (question.key === 'medication') {
    if (answer.includes("me ayudó")) {
      return "Bien que el medicamento te haya ayudado. Aún así, es importante que un médico evalúe tu caso para un tratamiento adecuado.";
    }
    if (answer.includes("no me ayudó")) {
      return "Si el medicamento no te ayudó, es importante consultar con un médico para un tratamiento más efectivo.";
    }
    return "Es importante no automedicarse sin supervisión médica. Continuemos con la evaluación.";
  }

  return null; // Sin respuesta contextual específica
};

const SPECIALTY_RECOMMENDATIONS = {
  "Medicina General": [
    "síntomas generales", "fiebre", "malestar general", "dolor de cabeza",
    "resfriado", "gripe", "dolor de garganta", "tos", "fatiga"
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

const MEDICATION_RECOMMENDATIONS = {
  headache: {
    mild: "Para dolores de cabeza leves, suelen utilizarse analgésicos de venta libre como paracetamol, siempre y cuando no tengas alergias ni contraindicaciones.",
    moderate: "Para dolor de cabeza moderado, pueden utilizarse analgésicos como paracetamol o ibuprofeno, pero es importante no exceder las dosis recomendadas y consultar a un profesional.",
    severe: "Dado que el dolor de cabeza es intenso, evita automedicarte en exceso y busca valoración médica; el analgésico solo debería ser una medida temporal."
  },
  fever: {
    mild: "Para fiebre leve se usan con frecuencia medicamentos como paracetamol. Mantén buena hidratación y monitorea la temperatura.",
    moderate: "Si la fiebre es moderada, se pueden usar antipiréticos como paracetamol; si persiste más de 48 horas, es recomendable acudir al médico.",
    severe: "Con fiebre alta o persistente, la automedicación sólo debe ser temporal y bajo vigilancia; se recomienda valoración médica urgente."
  },
  pain_general: {
    mild: "Para malestares generales leves muchas personas usan analgésicos simples (por ejemplo, paracetamol) y reposo.",
    moderate: "Para dolor moderado pueden usarse analgésicos como paracetamol o antiinflamatorios, siempre respetando dosis y antecedentes médicos.",
    severe: "Cuando el dolor es intenso, la prioridad es la valoración médica; evita aumentar la dosis por tu cuenta y busca ayuda profesional."
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

  // Obtener la pregunta actual dinámicamente
  const currentQuestion = getNextQuestion(answers, currentQuestionIndex);

  // Inicializar chat
  useEffect(() => {
    if (messages.length === 0 && currentQuestion) {
      addBotMessage(currentQuestion.question);
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

  const simulateTyping = (callback, delay = 900) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleAnswer = (answerValue = null) => {
    // Usar el valor pasado como parámetro o el estado actual
    const answer = answerValue || currentAnswer;
    if (!answer || !answer.trim() || !currentQuestion) return;

    // Agregar mensaje del usuario
    addUserMessage(answer);

    const newAnswers = {
      ...answers,
      [currentQuestion.key]: answer
    };
    setAnswers(newAnswers);

    // Limpiar la respuesta actual
    setCurrentAnswer('');

    // Obtener respuesta contextual
    const contextualResponse = getContextualResponse(currentQuestion, answer, newAnswers);

    if (contextualResponse) {
      simulateTyping(() => {
        addBotMessage(contextualResponse);
        
        // Después de la respuesta contextual, continuar con la siguiente pregunta
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          const nextQuestion = getNextQuestion(newAnswers, nextIndex);
          
          if (nextQuestion) {
            setCurrentQuestionIndex(nextIndex);
            simulateTyping(() => {
              addBotMessage(nextQuestion.question);
            }, 1000);
          } else {
            // No hay más preguntas, generar diagnóstico
            setTimeout(() => {
              generateDiagnosis(newAnswers);
            }, 1000);
          }
        }, 1500);
      }, 1000);
    } else {
      // Si no hay respuesta contextual, ir directamente a la siguiente pregunta
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = getNextQuestion(newAnswers, nextIndex);
      
      if (nextQuestion) {
        setTimeout(() => {
          setCurrentQuestionIndex(nextIndex);
          simulateTyping(() => {
            addBotMessage(nextQuestion.question);
          }, 1000);
        }, 500);
      } else {
        // No hay más preguntas, generar diagnóstico
        setTimeout(() => {
          generateDiagnosis(newAnswers);
        }, 500);
      }
    }
  };

  const generateDiagnosis = (allAnswers) => {
    // Mostrar mensaje de análisis
    const analyzingMessages = AI_RESPONSES.analyzing || [
      "Analizando tus síntomas...",
      "Revisando la información proporcionada...",
      "Evaluando la gravedad de tu caso...",
      "Comparando con patrones médicos conocidos..."
    ];

    addBotMessage("Déjame analizar toda la información que me has proporcionado...", 0);

    // Simular análisis con mensajes encadenados pero más ágiles
    setTimeout(() => {
      addBotMessage(`✓ ${analyzingMessages[0]}`, 300);
    }, 600);

    if (analyzingMessages[1]) {
      setTimeout(() => {
        addBotMessage(`✓ ${analyzingMessages[1]}`, 300);
      }, 1200);
    }

    if (analyzingMessages[2]) {
      setTimeout(() => {
        addBotMessage("✓ Recomendaciones generadas", 300);
      }, 1800);
    }

    // Determinar especialidad recomendada con IA mejorada
    setTimeout(() => {
      const symptomText = (allAnswers.mainSymptom || '').toLowerCase();
      const additionalInfo = (allAnswers.additionalInfo || '').toLowerCase();
      const existingConditions = (allAnswers.existingConditions || '').toLowerCase();
      const additionalSymptoms = (allAnswers.additionalSymptoms || '').toLowerCase();
      const combinedText = `${symptomText} ${additionalInfo} ${existingConditions} ${additionalSymptoms}`;

      let specialtyScores = {};
      
      Object.keys(SPECIALTY_RECOMMENDATIONS).forEach(specialty => {
        const keywords = SPECIALTY_RECOMMENDATIONS[specialty];
        const score = keywords.reduce((acc, keyword) => {
          if (combinedText.includes(keyword.toLowerCase())) {
            return acc + 2;
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
      if (fever === 'Sí' || (fever.includes('Fiebre') && specialtyScores['Medicina General'] === 0)) {
        specialtyScores['Medicina General'] = 3;
      }

      if (painLevel.includes('9-10') && combinedText.includes('pecho')) {
        specialtyScores['Cardiología'] = (specialtyScores['Cardiología'] || 0) + 5;
      }

      if (combinedText.includes('dificultad para respirar') || combinedText.includes('dificultad respirar')) {
        if (combinedText.includes('pecho')) {
          specialtyScores['Cardiología'] = (specialtyScores['Cardiología'] || 0) + 3;
        }
        specialtyScores['Medicina General'] = (specialtyScores['Medicina General'] || 0) + 2;
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
      if (allAnswers.painLevel) {
        diagnosisText += `• **Intensidad:** ${allAnswers.painLevel}\n`;
      }
      if (allAnswers.fever) {
        diagnosisText += `• **Fiebre:** ${allAnswers.fever}\n`;
      }
      if (allAnswers.additionalSymptoms && allAnswers.additionalSymptoms !== 'Ninguno') {
        diagnosisText += `• **Síntomas adicionales:** ${allAnswers.additionalSymptoms}\n`;
      }
      if (allAnswers.existingConditions) {
        diagnosisText += `• **Condiciones previas:** ${allAnswers.existingConditions}\n`;
      }
      diagnosisText += `\n`;

      // Recomendaciones inteligentes y cálculo de severidad
      let recommendationText = '';
      let severityLevel = 'leve';

      if (painLevel.includes('9-10') || painLevel.includes('7-8') || additionalSymptoms.includes('dificultad para respirar')) {
        recommendationText = AI_RESPONSES.recommendations.urgent;
        severityLevel = 'alta';
      } else if (fever === 'Sí' || fever.includes('Fiebre alta') || fever.includes('Más de 39°C') || 
                 duration.includes('Más de una semana')) {
        recommendationText = AI_RESPONSES.recommendations.moderate;
        severityLevel = 'moderada';
      } else {
        recommendationText = AI_RESPONSES.recommendations.mild;
        severityLevel = 'leve';
      }

      const severityIcon = severityLevel === 'alta' ? '🔴' : severityLevel === 'moderada' ? '🟠' : '🟢';
      diagnosisText += `💡 **Mi recomendación (severidad ${severityIcon} ${severityLevel.toUpperCase()})**:\n\n`;
      diagnosisText += `${recommendationText}\n\n`;
      diagnosisText += `Basado en el análisis de tus síntomas, te recomiendo agendar una cita con **${recommended}**.\n\n`;
      
      // Recomendación de medicamentos de referencia (no sustituye consulta)
      let medsAdvice = '';
      const hasHeadache = symptomText.includes('cabeza');
      const hasFever = symptomText.includes('fiebre') || fever.includes('Fiebre') || fever === 'Sí';
      const hasGeneralPain = symptomText.includes('dolor') || symptomText.includes('malestar');

      const painIsSevere = painLevel.includes('9-10') || painLevel.includes('7-8');
      const painIsModerate = painLevel.includes('4-6');

      if (hasHeadache) {
        if (painIsSevere) {
          medsAdvice = MEDICATION_RECOMMENDATIONS.headache.severe;
        } else if (painIsModerate) {
          medsAdvice = MEDICATION_RECOMMENDATIONS.headache.moderate;
        } else {
          medsAdvice = MEDICATION_RECOMMENDATIONS.headache.mild;
        }
      } else if (hasFever) {
        if (severityLevel === 'alta') {
          medsAdvice = MEDICATION_RECOMMENDATIONS.fever.severe;
        } else if (severityLevel === 'moderada') {
          medsAdvice = MEDICATION_RECOMMENDATIONS.fever.moderate;
        } else {
          medsAdvice = MEDICATION_RECOMMENDATIONS.fever.mild;
        }
      } else if (hasGeneralPain) {
        if (painIsSevere) {
          medsAdvice = MEDICATION_RECOMMENDATIONS.pain_general.severe;
        } else if (painIsModerate) {
          medsAdvice = MEDICATION_RECOMMENDATIONS.pain_general.moderate;
        } else {
          medsAdvice = MEDICATION_RECOMMENDATIONS.pain_general.mild;
        }
      }

      if (medsAdvice) {
        diagnosisText += `💊 **Recomendación orientativa de medicamentos:**\n\n`;
        diagnosisText += `${medsAdvice}\n\n`;
      }

      // Consejos adicionales según el caso
      if (fever === 'Sí' || fever.includes('Fiebre')) {
        diagnosisText += `🌡️ **Consejo:** Mientras tanto, mantente hidratado y descansa. Si la fiebre supera los 38.5°C, considera atención inmediata.\n\n`;
      }
      
      if (painLevel.includes('9-10')) {
        diagnosisText += `⚠️ **Importante:** Dado el nivel de dolor que describes, no dudes en buscar atención médica de emergencia si el dolor empeora.\n\n`;
      }

      if (combinedText.includes('dolor de pecho') && (painLevel.includes('7-8') || painLevel.includes('9-10'))) {
        diagnosisText += `🚨 **Atención:** El dolor en el pecho de alta intensidad requiere evaluación médica urgente. Si el dolor empeora o se extiende al brazo, busca atención de emergencia inmediatamente.\n\n`;
      }

      diagnosisText += `📌 **Nota importante:** Esta es una evaluación preliminar basada en inteligencia artificial. Las recomendaciones de medicamentos son solo de referencia general y pueden no ser adecuadas para todos los pacientes. No reemplaza una consulta médica profesional. Si tus síntomas empeoran o tienes dudas, busca atención médica inmediata.`;

      // Mostrar resultado en el chat de forma más rápida y fluida
      setTimeout(() => {
        addBotMessage("He completado mi análisis. Aquí están mis recomendaciones:", 0);
        setTimeout(() => {
          addBotMessage(diagnosisText, 0);
          setTimeout(() => {
            addBotMessage(`🎯 **Especialidad recomendada: ${recommended}**\n\n¿Te gustaría agendar una cita ahora?`, 0);
            setShowResult(true);
          }, 700);
        }, 400);
      }, 2200);
    }, 2200);
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
    const firstQuestion = getNextQuestion({}, 0);
    setTimeout(() => {
      if (firstQuestion) {
        addBotMessage(firstQuestion.question);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !showResult) {
      e.preventDefault();
      handleAnswer();
    }
  };

  if (!currentQuestion && !showResult) {
    // Si no hay pregunta actual y no hay resultado, generar diagnóstico
    if (Object.keys(answers).length > 0) {
      generateDiagnosis(answers);
    }
    return null;
  }

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
                            setTimeout(() => {
                              handleAnswer(option);
                            }, 200);
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
