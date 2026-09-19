import type { ModelInfo } from "@/lib/api";

/**
 * "Inside the AI".
 *
 * When the backend is reachable these numbers are read off the loaded model
 * (classes_, n_features_in_, and the training facts saved by train_model.py).
 * The fallbacks match the dataset the model was trained on.
 */
export function ModelTransparency({ model }: { model: ModelInfo | null }) {
  const stats = [
    {
      value: (model?.training_samples ?? 6596).toLocaleString(),
      label: "Training samples",
    },
    { value: String(model?.n_classes ?? 22), label: "Crop classes" },
    { value: String(model?.n_features ?? 7), label: "Input features" },
    {
      value: model?.algorithm === "RandomForestClassifier"
        ? "Random Forest"
        : (model?.algorithm ?? "Random Forest"),
      label: "ML algorithm",
    },
  ];

  return (
    <section className="border-t border-white/[0.06] py-16 sm:py-20">
      <div className="container">
        <h2 className="text-2xl font-medium tracking-tight text-cream">
          Inside the AI
        </h2>
        <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-cream-faint">
          NaturaAI uses a Random Forest classification model trained on
          agricultural soil and environmental data.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="text-3xl font-semibold tracking-[-0.03em] text-cream sm:text-4xl">
                {stat.value}
              </dd>
              <dt className="mt-2 text-[12.5px] text-cream-faint">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        {model?.accuracy !== undefined && (
          <p className="mt-10 text-[12.5px] text-cream-faint">
            Held-out test accuracy at training time:{" "}
            <span className="text-cream-dim">
              {(model.accuracy * 100).toFixed(1)}%
            </span>
            {model.trained_at ? ` · trained ${model.trained_at}` : null}
          </p>
        )}
      </div>
    </section>
  );
}
