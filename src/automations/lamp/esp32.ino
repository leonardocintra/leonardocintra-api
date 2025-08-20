#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "NOM ";
const char* password = "senha123";

// IP fixo
IPAddress local_IP(192,168,15,50);  
IPAddress gateway(192,168,15,1);  
IPAddress subnet(255,255,255,0);  
IPAddress primaryDNS(8,8,8,8);  
IPAddress secondaryDNS(8,8,4,4);  

// Broker MQTT HiveMQ Cloud
const char* mqtt_server = "246bc5a388ec4e978794cc3efb0d83b5.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

// Suas credenciais do HiveMQ Cloud
const char* mqtt_user = "user";     // Substitua pelo seu usuário
const char* mqtt_password = "senha";   // Substitua pela sua senha

// Cliente WiFi seguro e MQTT
WiFiClientSecure espClientSecure;
PubSubClient client(espClientSecure);

const int relePin = 25;

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  msg.toLowerCase();
  
  Serial.print("Mensagem recebida: ");
  Serial.println(msg);
  
  if(msg == "on") {
    digitalWrite(relePin, LOW);  // Liga (active LOW)
    Serial.println("Lâmpada LIGADA");
  }
  if(msg == "off") {
    digitalWrite(relePin, HIGH); // Desliga
    Serial.println("Lâmpada DESLIGADA");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT...");
    
    // Gera um ID único para o cliente
    String clientId = "ESP32Lamp-";
    clientId += String(random(0xffff), HEX);
    
    // Tenta conectar com usuário e senha
    if(client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println(" Conectado!");
      client.subscribe("casa/lampada");
      Serial.println("Inscrito no tópico: casa/lampada");
    } else {
      Serial.print(" Falha, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(relePin, OUTPUT);
  digitalWrite(relePin, HIGH); // Inicia desligado
  
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("=== ESP32 Lamp Control ===");
  
  // Configuração SSL - Aceita qualquer certificado (INSEGURO mas funcional)
  espClientSecure.setInsecure();
  
  // IP fixo
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Falha ao configurar IP fixo");
  }
  
  // Conecta WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());
  
  // Configura MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Buffer maior para mensagens MQTT (se necessário)
  client.setBufferSize(256);
  
  Serial.println("Setup concluído!");
}

void loop() {
  if(!client.connected()){
    reconnect();
  }
  client.loop();
  
  // Heartbeat a cada 30 segundos
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    if(client.connected()) {
      Serial.println("MQTT: Conectado e funcionando");
    }
    lastHeartbeat = millis();
  }
}