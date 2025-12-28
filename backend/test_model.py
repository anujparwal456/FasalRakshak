import tensorflow as tf

model = tf.keras.models.load_model("models/MobileNetV2_best.h5")
print("✅ Model loaded successfully")
