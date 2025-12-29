import tensorflow as tf
print(f"TensorFlow version: {tf.__version__}")

try:
    from tensorflow.keras.layers import Dense
    print("tensorflow.keras.layers import: successful")
except Exception as e:
    print(f"tensorflow.keras.layers import failed: {e}")

try:
    from keras.layers import Dense
    print("keras.layers import: successful")
except Exception as e:
    print(f"keras.layers import failed: {e}")

try:
    import keras
    print(f"Keras version: {keras.__version__}")
except Exception as e:
    print(f"Keras import failed: {e}")
